#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

import { execSync } from 'child_process';

const envPath = path.resolve(process.cwd(), '.env');
const env = fs.existsSync(envPath)
	? Object.fromEntries(fs.readFileSync(envPath, 'utf8').split('\n').filter(Boolean).map(line => {
		const parts = line.split('=');
		return [parts[0].trim(), parts.slice(1).join('=').trim()];
	}))
	: process.env;

const token = env.GITHUB_TOKEN;
const prValue = env.PR_URL || env.PR_NUMBER;

if (!token || !prValue) {
	console.error('Ошибка: GITHUB_TOKEN или PR_NUMBER/PR_URL не найдены в .env');
	process.exit(1);
}

let owner, repo, pullNumber;

if (prValue.startsWith('http')) {
	const urlMatch = prValue.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
	if (!urlMatch) {
		console.error('Ошибка: неверный формат PR_URL');
		process.exit(1);
	}
	owner = urlMatch[1];
	repo = urlMatch[2];
	pullNumber = parseInt(urlMatch[3], 10);
} else {
	pullNumber = parseInt(prValue, 10);
	if (Number.isNaN(pullNumber)) {
		console.error('Ошибка: PR_NUMBER должен быть числом');
		process.exit(1);
	}
	try {
		const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
		const repoMatch = remoteUrl.match(/github\.com[:/]([^/]+)\/([^/.]+?)(?:\.git)?$/);
		if (!repoMatch) throw new Error('Не удалось разобрать URL репозитория');
		owner = repoMatch[1];
		repo = repoMatch[2];
	} catch (e) {
		console.error(`Ошибка: ${e.message}. Используйте PR_URL.`);
		process.exit(1);
	}
}

const query = `
query($owner: String!, $repo: String!, $pullNumber: Int!, $cursor: String) {
  repository(owner: $owner, name: $repo) {
    pullRequest(number: $pullNumber) {
      reviewThreads(first: 100, after: $cursor) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          isResolved
          path
          line
          comments(first: 1) {
            nodes {
              body
              url
            }
          }
        }
      }
    }
  }
}
`;

async function fetchGraphQL(query, variables) {
	const response = await fetch('https://api.github.com/graphql', {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${token}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ query, variables }),
	});

	const data = await response.json();
	if (!response.ok || data.errors) {
		const errorMsg = data.errors ? data.errors[0].message : response.statusText;
		throw new Error(`Ошибка GraphQL API: ${errorMsg}`);
	}

	return data.data;
}

function cleanBody(body) {
	if (!body.includes('CodeRabbit')) return body.trim();

	let mainPart = body.split(/<details|---|<!--/)[0].trim();
	mainPart = mainPart.replace(/_⚠️ Potential issue_ \| _[^_]+_/, '').trim();

	if (mainPart.length > 0) {
		const firstChar = mainPart[0];
		if (/^\p{Lu}$/u.test(firstChar) && mainPart.length > 1) {
			mainPart = firstChar.toLowerCase() + mainPart.slice(1);
		}
	}

	const promptMatch = body.match(/<summary>🤖 Prompt for AI Agents<\/summary>[\s\S]*?```([\s\S]*?)```[\s\S]*?<\/details>/);
	const cleanPrompt = promptMatch
		? `\n\n> 🤖 **Prompt:**\n> ${promptMatch[1].trim().replace(/\n/g, '\n> ')}`
		: '';

	return `${mainPart}${cleanPrompt}`;
}

async function main() {
	try {
		const args = process.argv.slice(2);
		const includeResolved = args.includes('--include-resolved');

		console.log(`Получение ВСЕХ обсуждений для PR #${pullNumber} (${owner}/${repo})...`);

		let allThreads = [];
		let hasNextPage = true;
		let cursor = null;

		while (hasNextPage) {
			const result = await fetchGraphQL(query, { owner, repo, pullNumber, cursor });

			if (!result.repository || !result.repository.pullRequest) {
				console.error(`Ошибка: PR #${pullNumber} не найден в репозитории ${owner}/${repo}`);
				process.exit(1);
			}

			const { nodes, pageInfo } = result.repository.pullRequest.reviewThreads;
			allThreads = allThreads.concat(nodes);

			hasNextPage = pageInfo.hasNextPage;
			cursor = pageInfo.endCursor;

			if (hasNextPage) {
				process.stdout.write('.');
			}
		}
		console.log(' Готово.');

		const threads = allThreads;
		const unresolvedThreads = threads.filter(thread => !thread.isResolved);
		const resolvedThreads = threads.filter(thread => thread.isResolved);

		console.log(`Всего тредов: ${threads.length}`);
		console.log(`Открытых: ${unresolvedThreads.length}`);
		console.log(`Разрешенных: ${resolvedThreads.length}`);

		const threadsToProcess = includeResolved ? threads : unresolvedThreads;

		const outputPath = path.resolve(process.cwd(), 'docs/REVIEW.md');

		if (threadsToProcess.length === 0) {
			console.log('Нет комментариев для обработки.');
			if (resolvedThreads.length > 0 && !includeResolved) {
				console.log('💡 Совет: Запустите с флагом `--include-resolved`, чтобы включить разрешенные комментарии.');
			}
			const emptyMarkdown = `# Задачи по ревью PR - #${pullNumber}\n\n`;
			fs.writeFileSync(outputPath, emptyMarkdown + '✅ Все комментарии закрыты!\n');
			return;
		}

		let markdown = `# Задачи по ревью PR - #${pullNumber}\n\n`;
		markdown += `**Источник:** [PR #${pullNumber} на GitHub](https://github.com/${owner}/${repo}/pull/${pullNumber})\n`;
		markdown += `**Сгенерировано:** ${new Date().toLocaleString()}\n\n`;
		markdown += `> [!NOTE]\n`;
		markdown += `> Этот файл создан автоматически. Отмечайте выполненные пункты как [x].\n\n`;

		const threadsByFile = threadsToProcess.reduce((acc, thread) => {
			const file = thread.path || 'Общие замечания';
			if (!acc[file]) acc[file] = [];
			acc[file].push(thread);
			return acc;
		}, {});

		for (const [file, fileThreads] of Object.entries(threadsByFile)) {
			markdown += `## 📄 Файл: ${file}\n\n`;

			for (const thread of fileThreads) {
				const firstComment = thread.comments?.nodes?.[0];
				if (!firstComment) continue;

				const rawBody = firstComment.body;
				const body = cleanBody(rawBody);
				const line = thread.line || 'diff';
				const url = firstComment.url;
				const threadId = thread.id;
				const status = thread.isResolved ? '✅ (RESOLVED)' : '⭕ (OPEN)';

				markdown += `### 💬 Комментарий на строке ${line} ${status}\n`;
				markdown += `<!-- threadId: ${threadId} -->\n`;
				markdown += `- [ ] **Задача:** ${body}\n`;
				markdown += `  - **Перевод:** [ждет вашего описания]\n`;
				markdown += `  - **Оценка сложности (1-10):** [ ]\n`;
				markdown += `  - **Стоит ли исправлять:** [ ] да / [ ] нет / [ ] обсудить\n`;
				markdown += `  - [Посмотреть на GitHub](${url})\n\n`;
			}
		}

		fs.writeFileSync(outputPath, markdown.replace(/—/g, '-'));

		console.log(`\nГотово! Создан чеклист для ${threadsToProcess.length} веток обсуждения.`);
		console.log(`Файл: ${outputPath}`);

	} catch (error) {
		console.error(`\nОшибка при выполнении: ${error.message}`);
		process.exit(1);
	}
}

main();

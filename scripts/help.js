
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packagePath = join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));

const commandDescriptions = {
  'dev': 'запуск dev сервера',
  'build': 'сборка проекта',
  'preview': 'предпросмотр сборки',
  'test': 'запуск тестов (один раз)',
  'test:watch': 'запуск тестов в watch режиме',
  'test:ui': 'запуск тестов с UI',
  'test:coverage': 'запуск тестов с покрытием',
  'lint': 'проверка кода линтером',
  'lint:docs': 'проверка форматирования документации',
  'format:docs': 'форматирование документации',
  'pack:docs': 'упаковка документации',
  'pack:src': 'упаковка исходников',
  'pack:all': 'упаковка всего проекта',
  'diff': 'показать git diff',
  'deploy': 'деплой на gh-pages',
};

const availableCommands = Object.keys(commandDescriptions).filter(
  (cmd) => packageJson.scripts[cmd]
);

console.log('\n📦 Доступные команды:\n');
availableCommands.forEach((cmd) => {
  const description = commandDescriptions[cmd];
  const paddedCommand = cmd.padEnd(20);
  console.log(`  pnpm ${paddedCommand} - ${description}`);
});
console.log('');

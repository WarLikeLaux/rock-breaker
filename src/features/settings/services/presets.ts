export interface PresetMeta {
	id: string;
	name: string;
	description: string;
	file: string;
}

interface PresetManifest {
	presets: PresetMeta[];
}

const BASE_URL = import.meta.env.BASE_URL;

export async function fetchPresets(): Promise<PresetMeta[]> {
	try {
		const response = await fetch(`${BASE_URL}presets/manifest.json`);
		if (!response.ok) {
			console.warn(`Не удалось загрузить манифест пресетов: ${response.status} ${response.statusText}`);
			return [];
		}
		const manifest: PresetManifest = await response.json();
		return manifest.presets;
	} catch (error) {
		console.warn(`Ошибка загрузки манифеста пресетов из ${BASE_URL}presets/manifest.json:`, error);
		return [];
	}
}

const SAFE_FILENAME_PATTERN = /^[A-Za-z0-9._-]+$/;

export async function loadPreset(filename: string): Promise<string | null> {
	if (!filename || !SAFE_FILENAME_PATTERN.test(filename) ||
		filename.includes('..') || filename.startsWith('/') || filename.startsWith('\\')) {
		console.warn(`Небезопасное имя файла пресета: ${filename}`);
		return null;
	}
	try {
		const response = await fetch(`${BASE_URL}presets/${filename}`);
		if (!response.ok) {
			console.warn(`Не удалось загрузить пресет ${filename}: ${response.status}`);
			return null;
		}
		return await response.text();
	} catch (error) {
		console.warn(`Ошибка загрузки пресета ${filename}:`, error);
		return null;
	}
}

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
		if (!response.ok) return [];
		const manifest: PresetManifest = await response.json();
		return manifest.presets;
	} catch {
		return [];
	}
}

export async function loadPreset(filename: string): Promise<string | null> {
	try {
		const response = await fetch(`${BASE_URL}presets/${filename}`);
		if (!response.ok) return null;
		return await response.text();
	} catch {
		return null;
	}
}

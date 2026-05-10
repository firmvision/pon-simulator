import type { ProjectFile } from '../types/topology';

export function saveProjectToFile(project: ProjectFile) {
  const name = project.metadata.name.replace(/\s+/g, '-') || 'pon-project';
  const json = JSON.stringify(project, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}.pon`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function loadProjectFromFile(): Promise<ProjectFile> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pon,.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return reject(new Error('No file'));
      try {
        const text = await file.text();
        const project = JSON.parse(text) as ProjectFile;
        resolve(project);
      } catch {
        reject(new Error('Invalid project file'));
      }
    };
    input.click();
  });
}

// テキスト差分比較ロジック（純粋関数）

import { diffLines, diffChars, type Change } from 'diff';

export type DiffMode = 'lines' | 'chars';

export interface DiffPart {
  value: string;
  type: 'added' | 'removed' | 'unchanged';
}

export interface DiffResult {
  parts: DiffPart[];
  addedCount: number;
  removedCount: number;
}

function mapChanges(changes: Change[]): DiffPart[] {
  return changes.map((change) => ({
    value: change.value,
    type: change.added ? 'added' as const : change.removed ? 'removed' as const : 'unchanged' as const,
  }));
}

export function computeDiff(textA: string, textB: string, mode: DiffMode): DiffResult {
  const changes = mode === 'lines' ? diffLines(textA, textB) : diffChars(textA, textB);
  const parts = mapChanges(changes);

  let addedCount = 0;
  let removedCount = 0;

  for (const part of parts) {
    if (mode === 'lines') {
      const lineCount = part.value.split('\n').filter((l) => l !== '').length;
      if (part.type === 'added') addedCount += lineCount;
      if (part.type === 'removed') removedCount += lineCount;
    } else {
      if (part.type === 'added') addedCount += [...part.value].length;
      if (part.type === 'removed') removedCount += [...part.value].length;
    }
  }

  return { parts, addedCount, removedCount };
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'));
    reader.readAsText(file);
  });
}

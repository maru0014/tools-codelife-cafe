// JSON整形ロジック（純粋関数）

export type IndentType = '2' | '4' | 'tab';

export interface FormatResult {
  success: boolean;
  output: string;
  error?: string;
  errorPosition?: number;
}

function getIndentString(indent: IndentType): string | number {
  switch (indent) {
    case '2': return 2;
    case '4': return 4;
    case 'tab': return '\t';
  }
}

export function formatJson(input: string, indent: IndentType = '2'): FormatResult {
  if (!input.trim()) {
    return { success: true, output: '' };
  }
  try {
    const parsed = JSON.parse(input);
    const formatted = JSON.stringify(parsed, null, getIndentString(indent));
    return { success: true, output: formatted };
  } catch (e) {
    const error = e as SyntaxError;
    const match = error.message.match(/position (\d+)/i);
    const errorPosition = match ? parseInt(match[1], 10) : undefined;
    return {
      success: false,
      output: input,
      error: `JSON構文エラー: ${error.message}`,
      errorPosition,
    };
  }
}

export function minifyJson(input: string): FormatResult {
  if (!input.trim()) {
    return { success: true, output: '' };
  }
  try {
    const parsed = JSON.parse(input);
    const minified = JSON.stringify(parsed);
    return { success: true, output: minified };
  } catch (e) {
    const error = e as SyntaxError;
    return {
      success: false,
      output: input,
      error: `JSON構文エラー: ${error.message}`,
    };
  }
}

export function validateJson(input: string): FormatResult {
  if (!input.trim()) {
    return { success: true, output: '有効なJSONです' };
  }
  try {
    JSON.parse(input);
    return { success: true, output: '✅ 有効なJSONです' };
  } catch (e) {
    const error = e as SyntaxError;
    return {
      success: false,
      output: '',
      error: `❌ ${error.message}`,
    };
  }
}

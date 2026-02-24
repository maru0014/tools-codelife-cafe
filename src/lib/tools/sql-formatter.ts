import { format } from 'sql-formatter';

export type SqlDialect = 'sql' | 'mysql' | 'postgresql' | 'tsql' | 'plsql';
export type IndentStyle = '2spaces' | '4spaces' | 'tabs';

export interface SqlFormatOptions {
  dialect: SqlDialect;
  indent: IndentStyle;
  uppercase: boolean;
  compress: boolean;
}

export function formatSql(
  sql: string,
  options: SqlFormatOptions
): { output: string; error?: string } {
  if (!sql.trim()) return { output: '' };

  if (options.compress) {
    // Basic compression strategy
    const compressed = sql
      .replace(/--.*$/gm, '') // Remove single line comments
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi line comments
      .replace(/\s+/g, ' ') // Collapse whitespace
      .trim();

    if (options.uppercase) {
      // In compress mode with uppercase, we might still want keywords uppercase?
      // Full formatter is better. We can format it then compress it.
      try {
        const formatted = format(sql, {
          language: options.dialect,
          keywordCase: 'upper'
        });
        const comp = formatted.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
        return { output: comp };
      } catch {
        return { output: compressed };
      }
    }
    return { output: compressed };
  }

  try {
    const useTabs = options.indent === 'tabs';
    const tabWidth = options.indent === '4spaces' ? 4 : 2;

    const formatted = format(sql, {
      language: options.dialect,
      useTabs,
      tabWidth,
      keywordCase: options.uppercase ? 'upper' : 'preserve',
      linesBetweenQueries: 2,
    });
    return { output: formatted };
  } catch (error: any) {
    return {
      output: sql,
      error: `SQLの構文エラー: 該当行付近を確認してください。`,
    };
  }
}

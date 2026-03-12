/**
 * 電話番号フォーマッタ オーケストレーターコンポーネント
 * 全状態管理・モード切り替え
 */
import { useState, useEffect } from 'react';
import ModeToggle from './ModeToggle';
import SingleInput from './SingleInput';
import ResultCard from './ResultCard';
import BulkInput from './BulkInput';
import ResultTable from './ResultTable';
import ExportButtons from './ExportButtons';
import type { ParseResult, BulkResult } from '@/lib/phone-formatter/types';

const DEFAULT_VISIBLE_COLUMNS = ['#', 'input', 'e164', 'type', 'status'];
const STORAGE_KEY = 'phone-formatter-mode';

export default function PhoneFormatterPage() {
  const [mode, setMode] = useState<'single' | 'bulk'>(() => {
    // SSR時はデフォルト値
    if (typeof window === 'undefined') return 'single';
    return (localStorage.getItem(STORAGE_KEY) as 'single' | 'bulk') || 'single';
  });

  const [singleResult, setSingleResult] = useState<ParseResult | null>(null);
  const [bulkResult, setBulkResult] = useState<BulkResult | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(DEFAULT_VISIBLE_COLUMNS);

  // モード切替時にステートをリセット
  const handleModeChange = (newMode: 'single' | 'bulk') => {
    setMode(newMode);
    setSingleResult(null);
    setBulkResult(null);
    setVisibleColumns(DEFAULT_VISIBLE_COLUMNS);
  };

  return (
    <div className="space-y-6">
      {/* プライバシー通知 */}
      <div className="flex items-start gap-2 rounded-lg bg-safety/5 border border-safety/20 px-4 py-3">
        <span aria-hidden="true" className="text-safety text-sm mt-0.5">ℹ️</span>
        <p className="text-xs text-muted-foreground">
          このツールは完全にブラウザ上で動作します。電話番号がサーバーに送信されることはありません。
        </p>
      </div>

      {/* モード切り替え */}
      <ModeToggle mode={mode} onModeChange={handleModeChange} />

      {/* 単一入力モード */}
      {mode === 'single' && (
        <div className="space-y-4">
          <SingleInput onResult={setSingleResult} />
          <ResultCard result={singleResult} />
        </div>
      )}

      {/* 一括入力モード */}
      {mode === 'bulk' && (
        <div className="space-y-6">
          <BulkInput onBulkResult={(result) => {
            setBulkResult(result);
            setVisibleColumns(DEFAULT_VISIBLE_COLUMNS);
          }} />

          {bulkResult && bulkResult.results.length > 0 && (
            <>
              <hr className="border-border" />
              <ResultTable
                results={bulkResult.results}
                summary={bulkResult.summary}
                visibleColumns={visibleColumns}
                onVisibleColumnsChange={setVisibleColumns}
              />
              <ExportButtons
                results={bulkResult.results}
                visibleColumns={visibleColumns}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}

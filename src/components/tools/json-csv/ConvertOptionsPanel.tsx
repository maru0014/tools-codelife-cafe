import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type {
	CsvDelimiter,
	CsvToJsonOptions,
	JsonToCsvOptions,
} from '@/lib/tools/json-csv';

export type Direction = 'json-to-csv' | 'csv-to-json';

interface ConvertOptionsPanelProps {
	direction: Direction;
	jsonOpts: JsonToCsvOptions;
	csvOpts: CsvToJsonOptions;
	withBom: boolean;
	onJsonOptsChange: (options: JsonToCsvOptions) => void;
	onCsvOptsChange: (options: CsvToJsonOptions) => void;
	onWithBomChange: (value: boolean) => void;
}

const DELIMITER_VALUES: Record<string, CsvDelimiter> = {
	comma: ',',
	tab: '\t',
	semicolon: ';',
};

function delimiterToKey(delimiter: CsvDelimiter | 'auto'): string {
	if (delimiter === 'auto') return 'auto';
	return (
		Object.entries(DELIMITER_VALUES).find(([, v]) => v === delimiter)?.[0] ??
		'comma'
	);
}

function OptionSwitch({
	id,
	label,
	checked,
	onCheckedChange,
}: {
	id: string;
	label: string;
	checked: boolean;
	onCheckedChange: (value: boolean) => void;
}) {
	return (
		<div className="flex items-center gap-2">
			<Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
			<Label htmlFor={id} className="text-sm cursor-pointer">
				{label}
			</Label>
		</div>
	);
}

export function ConvertOptionsPanel({
	direction,
	jsonOpts,
	csvOpts,
	withBom,
	onJsonOptsChange,
	onCsvOptsChange,
	onWithBomChange,
}: ConvertOptionsPanelProps) {
	return (
		<div className="rounded-lg border border-border p-4">
			<p className="text-sm font-semibold mb-3">変換オプション</p>
			<div className="flex flex-wrap items-center gap-x-6 gap-y-3">
				{direction === 'json-to-csv' ? (
					<>
						<div className="flex items-center gap-2">
							<Label className="text-sm text-muted-foreground">
								区切り文字
							</Label>
							<Select
								value={delimiterToKey(jsonOpts.delimiter)}
								onValueChange={(key) =>
									onJsonOptsChange({
										...jsonOpts,
										delimiter: DELIMITER_VALUES[key],
									})
								}
							>
								<SelectTrigger className="w-[130px] h-8 rounded-lg bg-background">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="comma">カンマ（,）</SelectItem>
									<SelectItem value="tab">タブ</SelectItem>
									<SelectItem value="semicolon">セミコロン（;）</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="flex items-center gap-2">
							<Label className="text-sm text-muted-foreground">
								改行コード
							</Label>
							<Select
								value={jsonOpts.newline === '\r\n' ? 'crlf' : 'lf'}
								onValueChange={(key) =>
									onJsonOptsChange({
										...jsonOpts,
										newline: key === 'crlf' ? '\r\n' : '\n',
									})
								}
							>
								<SelectTrigger className="w-[150px] h-8 rounded-lg bg-background">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="crlf">CRLF（Windows）</SelectItem>
									<SelectItem value="lf">LF（Unix）</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<OptionSwitch
							id="opt-include-header"
							label="ヘッダー行を含める"
							checked={jsonOpts.includeHeader}
							onCheckedChange={(v) =>
								onJsonOptsChange({ ...jsonOpts, includeHeader: v })
							}
						/>
						<OptionSwitch
							id="opt-flatten"
							label="ネストを展開（ドット記法）"
							checked={jsonOpts.flattenNested}
							onCheckedChange={(v) =>
								onJsonOptsChange({ ...jsonOpts, flattenNested: v })
							}
						/>
						<OptionSwitch
							id="opt-bom"
							label="BOM付きUTF-8（Excel文字化け対策）"
							checked={withBom}
							onCheckedChange={onWithBomChange}
						/>
					</>
				) : (
					<>
						<div className="flex items-center gap-2">
							<Label className="text-sm text-muted-foreground">
								区切り文字
							</Label>
							<Select
								value={delimiterToKey(csvOpts.delimiter)}
								onValueChange={(key) =>
									onCsvOptsChange({
										...csvOpts,
										delimiter: key === 'auto' ? 'auto' : DELIMITER_VALUES[key],
									})
								}
							>
								<SelectTrigger className="w-[130px] h-8 rounded-lg bg-background">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="auto">自動判定</SelectItem>
									<SelectItem value="comma">カンマ（,）</SelectItem>
									<SelectItem value="tab">タブ</SelectItem>
									<SelectItem value="semicolon">セミコロン（;）</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<OptionSwitch
							id="opt-has-header"
							label="1行目をヘッダーとして扱う"
							checked={csvOpts.hasHeader}
							onCheckedChange={(v) =>
								onCsvOptsChange({ ...csvOpts, hasHeader: v })
							}
						/>
						<OptionSwitch
							id="opt-infer-types"
							label="型推論（数値・真偽値・null）"
							checked={csvOpts.inferTypes}
							onCheckedChange={(v) =>
								onCsvOptsChange({ ...csvOpts, inferTypes: v })
							}
						/>
						<OptionSwitch
							id="opt-unflatten"
							label="ドット記法キーをネスト復元"
							checked={csvOpts.unflattenDotKeys}
							onCheckedChange={(v) =>
								onCsvOptsChange({ ...csvOpts, unflattenDotKeys: v })
							}
						/>
					</>
				)}
			</div>
		</div>
	);
}

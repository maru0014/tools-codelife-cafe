export interface PreviewResult {
  headers: string[] | null;
  rows: string[][];
  totalRowEstimate: number;
  delimiter: string;
}

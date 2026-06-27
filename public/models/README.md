# models

`/upscale`（画像アップスケール）が実行時に読み込む超解像モデル。

- `realesr-general-x4v3.onnx` — Real-ESRGAN general x4 v3（SRVGGNetCompact, ~5MB）
  - 由来: xinntao/Real-ESRGAN の公式チェックポイントを ONNX 変換したもの
  - ライセンス: BSD-3-Clause

Service Worker のプリキャッシュ対象からは除外している（generate-sw.mjs）。

// client.ts — /transcribe の Worker ラッパ（メインスレッド側）
//
// キャンセルの正はここ（メインスレッド）の terminate()。
// WASM 推論中は Worker のイベントループがブロックされ cancel メッセージを処理できないため、
// プロトコルに cancel は持たせず、破棄 → 参照解放 → 世代ID更新 → idle 遷移で表現する。

import type { WorkerRequest, WorkerResponse } from './protocol.ts';

/** E2E で本物の推論 Worker を差し替えるためのフック（本番コードからは設定しない） */
type WorkerFactory = () => Worker;

declare global {
	interface Window {
		__TRANSCRIBE_WORKER_FACTORY__?: WorkerFactory;
	}
}

function createWorker(): Worker {
	const factory =
		typeof window !== 'undefined'
			? window.__TRANSCRIBE_WORKER_FACTORY__
			: undefined;
	if (factory) return factory();
	return new Worker(
		new URL('../../workers/transcribe.worker.ts', import.meta.url),
		{ type: 'module' },
	);
}

export type TranscribeClientHandlers = {
	onMessage: (message: WorkerResponse) => void;
	onFailure: (error: unknown) => void;
};

/**
 * Worker の生成・破棄・世代管理をまとめたハンドル。
 * terminate() 後に届いた遅延イベントは世代IDが変わっているため無視される。
 */
export class TranscribeClient {
	private worker: Worker | null = null;
	private generation = 0;

	constructor(private handlers: TranscribeClientHandlers) {}

	/** 現在の世代ID。UI 側の状態更新をガードするために使う */
	get currentGeneration(): number {
		return this.generation;
	}

	private ensureWorker(): Worker {
		if (this.worker) return this.worker;
		const worker = createWorker();
		const generation = this.generation;
		worker.addEventListener(
			'message',
			(event: MessageEvent<WorkerResponse>) => {
				if (generation !== this.generation) return;
				this.handlers.onMessage(event.data);
			},
		);
		worker.addEventListener('error', (event) => {
			if (generation !== this.generation) return;
			this.handlers.onFailure(event);
		});
		this.worker = worker;
		return worker;
	}

	post(request: WorkerRequest, transfer?: Transferable[]): void {
		const worker = this.ensureWorker();
		if (transfer && transfer.length > 0) {
			worker.postMessage(request, transfer);
		} else {
			worker.postMessage(request);
		}
	}

	/**
	 * Worker を即時破棄して idle へ戻す。エラー扱いはしない。
	 * 世代IDを進めるため、終了済み Worker からの遅延イベントは無視される。
	 */
	terminate(): void {
		this.generation += 1;
		if (this.worker) {
			this.worker.terminate();
			this.worker = null;
		}
	}
}

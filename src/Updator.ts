import {TransformTransaction} from "./TransformTransaction";
import {ClipTransaction} from "./ClipTransaction";
import {PathTransaction} from "./PathTransaction";
import {TextTransaction} from "./TextTransaction";
import {ChangeSequenceTransaction} from "./ChangeSequenceTransaction";
import {TransformMap} from "./TransformMap";
import {history} from "@s2study/draw-api";
import DrawHistory = history.DrawHistory;
import DrawHistoryEditSession = history.DrawHistoryEditSession;
import {AbstractTransaction} from "./AbstractTransaction";
import {LayerFactory} from "@s2study/draw-api/lib/structures/Layer";
export class Updater {

	private history: DrawHistory;
	private currentTransaction: AbstractTransaction | null = null;
	private updaterStartPoint: number;
	private editorLayerId: string | null = null;
	private transformMap: TransformMap = new TransformMap();
	private queue: Promise<any>;

	constructor(history: DrawHistory,
				editorLayerId?: string) {
		this.history = history;
		this.editorLayerId = editorLayerId === undefined ? null : editorLayerId;
		this.queue = Promise.resolve("success");
	}

	addLayer(): Promise<string> {
		this.queue = this.before().then((session) => {
			try {
				let moment = session.addLayer(LayerFactory.createInstance(), false);
				return moment.getKeys()[0];
			} finally {
				session.release();
			}
		});
		return this.queue;
	}

	removeLayer(layerId: string): Promise<any> {
		this.queue = this.before().then((session) => {
			try {
				session.removeLayer(layerId);
				return null;
			} finally {
				session.release();
			}
		});
		return this.queue;
	}

	getLayers(): string[] {
		return this.history.getLayers(
			this.history.getNowHistoryNumber(), true
		).filter((element) => {
			return this.editorLayerId !== element;
		});
	}

	beginTransform(layerId: string): Promise<TransformTransaction> {
		this.queue = this.before().then((session) => {
			let transaction = new TransformTransaction(session, this.history, layerId, this.editorLayerId!, this.transformMap);
			this.currentTransaction = transaction;
			return transaction;
		});
		return this.queue;
	}

	beginClip(layerId: string): Promise<ClipTransaction> {
		this.queue = this.before().then((session) => {
			let transaction = new ClipTransaction(session, this.history, layerId, this.editorLayerId!, this.transformMap);
			this.currentTransaction = transaction;
			return transaction;
		});
		return this.queue;
	}

	beginPath(layerId: string): Promise<PathTransaction> {
		this.queue = this.before().then((session) => {
			let transaction = new PathTransaction(session, this.history, layerId, this.editorLayerId!, this.transformMap);
			this.currentTransaction = transaction;
			return transaction;
		});
		return this.queue;
	}

	beginText(layerId: string): Promise<Text> {
		this.queue = this.before().then((session) => {
			let transaction = new TextTransaction(session, this.history, layerId, this.editorLayerId!, this.transformMap);
			this.currentTransaction = transaction;
			return transaction;
		});
		return this.queue;
	}

	beginChangeSequence(): Promise<ChangeSequenceTransaction> {
		this.queue = this.before().then((session) => {
			let transaction = new ChangeSequenceTransaction(session, this.history);
			this.currentTransaction = transaction;
			return transaction;
		});
		return this.queue;
	}

	canUndo(): boolean {
		return this.history.getNowHistoryNumber() > this.history.getFirstHistoryNumber()
			&& this.history.getFirstHistoryNumber() >= 0;
	}

	canRedo(): boolean {
		return this.history.getNowHistoryNumber() < this.history.getLastHistoryNumber()
			&& this.history.getLastHistoryNumber() >= 0;
	}

	undo(): Promise<any> {
		this.queue = this.before(true).then((session) => {
			try {
				let now = this.history.getNowHistoryNumber() | 0;
				if (now <= this.updaterStartPoint) {
					return null;
				}
				let numbers = this.history.getHistoryNumbers();
				let i = numbers.length - 1 | 0;
				while (i >= 0) {
					if (numbers[i] === now) {
						i = (i - 1) | 0;
						break;
					}
					i = (i - 1) | 0;
				}
				if (i < 0) {
					return null;
				}
				session.setHistoryNumberNow(numbers[i]);
			} finally {
				session.release();
			}
			return null;
		});
		return this.queue;
	}

	redo(): Promise<any> {
		this.queue = this.before(false).then((session) => {
			try {
				let now = this.history.getNowHistoryNumber() | 0;
				let numbers = this.history.getHistoryNumbers();
				let i = 0 | 0;
				while (i < numbers.length) {
					if (numbers[i] === now) {
						i = (i + 1) | 0;
						break;
					}
					i = (i + 1) | 0;
				}
				if (i >= numbers.length) {
					return null;
				}
				session.setHistoryNumberNow(numbers[i]);
			} finally {
				session.release();
			}
			return null;
		});
		return this.queue;
	}

	private before(commit: boolean = true): Promise<DrawHistoryEditSession> {

		let finish = false;

		// 前タスクとの同期
		this.queue = this.queue.then(() => {
			if (this.currentTransaction == null) {
				finish = true;
				return null;
			}
			if (commit) {
				this.currentTransaction.commit();
				this.currentTransaction = null;
				finish = true;
				return null;
			}
			this.currentTransaction.cancel();
			this.currentTransaction = null;
			finish = true;
			return null;
		});

		// 同期している場合は一度Promiseをクリア
		if (finish) {
			this.queue = Promise.resolve("success");
		}
		this.queue = this.queue.then(() => {
			return this.history.lock().then((session: DrawHistoryEditSession) => {
				if (this.editorLayerId != null) {
					return session;
				}
				let layers = this.history.getLayers(this.history.getNowHistoryNumber());
				if (layers != null && layers.length > 0) {
					this.editorLayerId = layers[layers.length - 1];
					return session;
				}
				let moment = session.addLayer(LayerFactory.createInstance(), true);
				this.editorLayerId = moment.getSequence()[0];
				this.updaterStartPoint = this.history.getNowHistoryNumber();
				return session;
			}).catch((e) => {
				console.warn(e);
				return null;
			});
		});
		return this.queue;
	}
}
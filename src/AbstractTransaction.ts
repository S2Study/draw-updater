import * as drawchat from "@s2study/draw-api";

import TransformTransaction = drawchat.updater.TransformTransaction;
import DrawHistory = drawchat.history.DrawHistory;
import DrawHistoryEditSession = drawchat.history.DrawHistoryEditSession;
import DrawTransaction = drawchat.updater.DrawTransaction;
export abstract class AbstractTransaction implements DrawTransaction {

	protected session: DrawHistoryEditSession;
	protected history: DrawHistory;
	protected startPoint: number;
	private savePoint: number;

	constructor(session: DrawHistoryEditSession,
				history: DrawHistory) {
		this.session = session;
		this.startPoint = history.getNowHistoryNumber();
		this.savePoint = this.startPoint;
		this.history = history;
	}

	setSavePoint(): void {
		this.savePoint = this.history.getNowHistoryNumber();
	}

	restoreSavePoint(): void {
		this.session.setHistoryNumberNow(this.savePoint);
	}

	cancel(duration: boolean = false): void {
		this.session.setHistoryNumberNow(this.startPoint);
		this.beforeCancel(duration);
		if (!duration) {
			this.session.release();
			return;
		}
		this.afterCancel(duration);
	}

	commit(duration: boolean = false): void {
		this.session.setHistoryNumberNow(this.startPoint);
		this.beforeCommit(duration);
		if (!duration) {
			this.session.release();
			this.afterCommit(duration);
			return;
		}
		this.startPoint = this.history.getNowHistoryNumber();
		this.afterCommit(duration);
	}

	isAlive(): boolean {
		return this.session.isAlive();
	}

	abstract flush(): void;

	protected abstract beforeCancel(duration: boolean): void;

	protected abstract afterCancel(duration: boolean): void;

	protected abstract beforeCommit(duration: boolean): void;

	protected abstract afterCommit(duration: boolean): void;
}

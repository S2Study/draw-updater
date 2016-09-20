import DrawchatUpdator = drawchat.updater.DrawchatUpdater;
import DrawHistory = drawchat.core.DrawHistory;
import DrawTransaction = drawchat.updater.DrawTransaction;
import TransformTransaction = drawchat.updater.TransformTransaction;
import ClipTransaction = drawchat.updater.ClipTransaction;
import TextTransaction = drawchat.updater.TextTransaction;
import ChangeSequenceTransaction = drawchat.updater.ChangeSequenceTransaction;
import DrawHistoryEditSession = drawchat.core.DrawHistoryEditSession;
import DrawchatUpdater = drawchat.updater.DrawchatUpdater;
import DrawPathTransaction = drawchat.updater.DrawPathTransaction;

import {Transform} from "./Transform";
import {Clip} from "./Clip";
import {Path} from "./Path";
import {Text} from "./Text";
import {ChangeSequence} from "./ChangeSequence";
import {TransformMap} from "./TransformMap";
export class Updater implements DrawchatUpdater{

	private history:DrawHistory;
	private currentTransaction:DrawTransaction = null;
	private updaterStartPoint:number;
	private editorLayerId:string = null;
	private transformMap:TransformMap = new TransformMap();
	private queue:Promise<any>;

	constructor(
		history:DrawHistory,
		editorLayerId?:string
	){
		this.history = history;
		this.editorLayerId = editorLayerId;
		this.queue = Promise.resolve('success');
	}

	addLayer():Promise<string> {
		this.queue = this.before().then((session)=>{
			try {
				let moment = session.addLayer({draws: []}, false);
				return moment.getKeys()[0];
			} finally {
				session.release();
			}
		});
		return this.queue;
	}

	removeLayer(layerId:string):Promise<any> {
		this.queue = this.before().then((session)=>{
			try {
				session.removeLayer(layerId);
				return null;
			} finally {
				session.release();
			}
		});
		return this.queue;
	}

	getLayers():string[] {
		return this.history.getLayers(
			this.history.getNowHistoryNumber(),true
		).filter((element)=>{
			return this.editorLayerId !== element;
		});
	}

	beginTransform(layerId:string,commit:boolean = true):Promise<TransformTransaction> {
		this.queue =  this.before().then((session)=>{
			let transaction = new Transform(session,this.history,layerId,this.editorLayerId,this.transformMap);
			this.currentTransaction = transaction;
			return transaction;
		});
		return this.queue;
	}

	beginClip(layerId:string,commit:boolean = true):Promise<ClipTransaction> {
		this.queue =  this.before().then((session)=>{
			let transaction = new Clip(session,this.history,layerId,this.editorLayerId,this.transformMap);
			this.currentTransaction = transaction;
			return transaction;
		});
		return this.queue;
	}

	beginPath(layerId:string,commit:boolean = true):Promise<DrawPathTransaction> {
		this.queue =  this.before().then((session)=>{
			let transaction = new Path(session,this.history,layerId,this.editorLayerId,this.transformMap);
			this.currentTransaction = transaction;
			return transaction;
		});
		return this.queue;
	}

	beginText(layerId:string,commit:boolean = true):Promise<TextTransaction> {
		this.queue = this.before().then((session)=>{
			let transaction = new Text(session,this.history,layerId,this.editorLayerId,this.transformMap);
			this.currentTransaction = transaction;
			return transaction;
		});
		return this.queue;
	}

	beginChangeSequence(commit:boolean = true):Promise<ChangeSequenceTransaction> {
		this.queue = this.before().then((session)=>{
			let transaction =  new ChangeSequence(session,this.history);
			this.currentTransaction = transaction;
			return transaction;
		});
		return this.queue;
	}

	canUndo():boolean {
		return this.history.getNowHistoryNumber() > this.history.getFirstHistoryNumber()
			&& this.history.getFirstHistoryNumber() >= 0;
	}

	canRedo():boolean {
		return this.history.getNowHistoryNumber() < this.history.getLastHistoryNumber()
			&& this.history.getLastHistoryNumber() >= 0;
	}

	undo():Promise<any> {
		this.queue = this.before(true).then((session)=>{
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

	redo():Promise<any> {
		this.queue = this.before(false).then((session)=>{
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

	private before(
		commit:boolean = true
	):Promise<DrawHistoryEditSession>{

		var finish = false;

		//前タスクとの同期
		this.queue =  this.queue.then(()=>{
			if(this.currentTransaction == null){
				finish = true;
				return null;
			}
			if(commit){
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

		//同期している場合は一度Promiseをクリア
		if(finish){
			this.queue = Promise.resolve('success');
		}
		this.queue = this.queue.then(()=>{
			return this.history.lock().then((session:DrawHistoryEditSession)=>{
				if(this.editorLayerId != null){
					return session;
				}
				let layers = this.history.getLayers(this.history.getNowHistoryNumber());
				if(layers != null && layers.length > 0){
					this.editorLayerId = layers[layers.length - 1];
					return session;
				}
				let moment = session.addLayer({draws:[]},true);
				this.editorLayerId = moment.getSequence()[0];
				this.updaterStartPoint = this.history.getNowHistoryNumber();
				return session;
			}).catch((e)=>{
				console.warn(e);
				return null;
			});
		});
		return this.queue;
	}
}
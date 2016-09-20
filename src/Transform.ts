import TransformTransaction = drawchat.updater.TransformTransaction;
import DrawHistory = drawchat.core.DrawHistory;
import DrawHistoryEditSession = drawchat.core.DrawHistoryEditSession;
import {TransformCalculator} from "./TransformCalculator";
import {AbstractLayerTransaction} from "./AbstractLayerTransaction";
import {TransformMap} from "./TransformMap";
export class Transform extends AbstractLayerTransaction implements TransformTransaction{

	private matrix:drawchat.Transform;
	// private layerId:string;

	constructor(
		session:DrawHistoryEditSession,
		history:DrawHistory,
		layerId:string,
		editLayerId:string,
		transformMap:TransformMap
	){
		super(session,history,layerId,editLayerId,transformMap);
		// this.layerId = layerId;
		this.matrix = null;
	}

	setMatrix(
		transform:drawchat.Transform
	):TransformTransaction {
		// this.init();
		this.matrix = transform;
		// this.getLayerBuilder().setTransForm(this.matrix).commit().commit();
		return this;
	}

	translate(tx: number, ty: number): drawchat.updater.TransformTransaction {
		// console.log(`tx:${tx} ty:${ty}`);
		this.init();
		return this.setMatrix(TransformCalculator.translate(this.getTransform(this.layerId),tx,ty));
	}

	scaleX(scaleX: number): drawchat.updater.TransformTransaction {
		this.init();
		return this.setMatrix(TransformCalculator.scaleX(this.getTransform(this.layerId),scaleX));
	}

	scaleY(scaleY: number): drawchat.updater.TransformTransaction {
		this.init();
		return this.setMatrix(TransformCalculator.scaleY(this.getTransform(this.layerId),scaleY));
	}

	scale(scaleX: number, scaleY: number): drawchat.updater.TransformTransaction {
		this.init();
		return this.setMatrix(TransformCalculator.scale(this.getTransform(this.layerId),scaleX,scaleY));
	}

	rotate(transform: drawchat.Transform, rad: number): drawchat.updater.TransformTransaction {
		this.init();
		return this.setMatrix(TransformCalculator.rotate(this.getTransform(this.layerId),rad));
	}

	skewX(transform: drawchat.Transform, radX: number): drawchat.updater.TransformTransaction {
		this.init();
		return this.setMatrix(TransformCalculator.skewX(this.getTransform(this.layerId),radX));
	}

	skewY(transform: drawchat.Transform, radY: number): drawchat.updater.TransformTransaction {
		this.init();
		return this.setMatrix(TransformCalculator.skewY(this.getTransform(this.layerId),radY));
	}

	skew(radX: number, radY: number): drawchat.updater.TransformTransaction {
		this.init();
		return this.setMatrix(TransformCalculator.skew(this.getTransform(this.layerId),radX,radY));
	}

	concat(transform: drawchat.Transform): drawchat.updater.TransformTransaction {
		this.init();
		return this.setMatrix(TransformCalculator.concatMatrix(this.getTransform(this.layerId),transform));
	}

	flush(): void {
		this.init();
		this.getLayerBuilder().setTransForm(this.matrix).commit().commit();
	}

	protected beforeCommit():void {
		if(this.matrix == null){
			return;
		}
		// console.log(JSON.stringify(this.matrix));
		this.getLayerBuilder().setTransForm(this.matrix).commit().commit();
		this.matrix = null;
	}

	protected beforeCancel(duration: boolean): void {
		// this.matrix = null;
		//	現在処理なし
	}

	protected afterCommit(duration: boolean): void {
		//	現在処理なし
	}

	protected afterCancel(): void {
		this.matrix = null;
	}
}

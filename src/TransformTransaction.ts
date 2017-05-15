import {TransformCalculator} from "./TransformCalculator";
import {AbstractLayerTransaction} from "./AbstractLayerTransaction";
import {TransformMap} from "./TransformMap";
import {structures, history} from "@s2study/draw-api";
import DrawHistoryEditSession = history.DrawHistoryEditSession;
import DrawHistory = history.DrawHistory;
import {TRANSFORM_DEFAULT} from "@s2study/draw-api/lib/structures/Transform";
import {DrawAPIUtils} from "@s2study/draw-api/lib/DrawAPIUtils";
export class TransformTransaction extends AbstractLayerTransaction {

	private matrix: structures.Transform | null;
	// private layerId:string;

	constructor(session: DrawHistoryEditSession,
				history: DrawHistory,
				layerId: string,
				editLayerId: string,
				transformMap: TransformMap) {
		super(session, history, layerId, editLayerId, transformMap);
		// this.layerId = layerId;
		this.matrix = null;
	}

	setMatrix(transform: structures.Transform): TransformTransaction {
		// this.init();
		this.matrix = transform;
		// this.getLayerBuilder().setTransForm(this.matrix).commit().commit();
		return this;
	}

	translate(tx: number, ty: number): TransformTransaction {
		// console.log(`tx:${tx} ty:${ty}`);
		this.init();
		return this.setMatrix(TransformCalculator.translate(this.getTransform(this.layerId), tx, ty));
	}

	scaleX(scaleX: number): TransformTransaction {
		this.init();
		return this.setMatrix(TransformCalculator.scaleX(this.getTransform(this.layerId), scaleX));
	}

	scaleY(scaleY: number): TransformTransaction {
		this.init();
		return this.setMatrix(TransformCalculator.scaleY(this.getTransform(this.layerId), scaleY));
	}

	scale(scaleX: number, scaleY: number): TransformTransaction {
		this.init();
		return this.setMatrix(TransformCalculator.scale(this.getTransform(this.layerId), scaleX, scaleY));
	}

	rotate(transform: structures.Transform, rad: number): TransformTransaction {
		this.init();
		return this.setMatrix(TransformCalculator.rotate(this.getTransform(this.layerId), rad));
	}

	skewX(transform: structures.Transform, radX: number): TransformTransaction {
		this.init();
		return this.setMatrix(TransformCalculator.skewX(this.getTransform(this.layerId), radX));
	}

	skewY(transform: structures.Transform, radY: number): TransformTransaction {
		this.init();
		return this.setMatrix(TransformCalculator.skewY(this.getTransform(this.layerId), radY));
	}

	skew(radX: number, radY: number): TransformTransaction {
		this.init();
		return this.setMatrix(TransformCalculator.skew(this.getTransform(this.layerId), radX, radY));
	}

	concat(transform: structures.Transform): TransformTransaction {
		this.init();
		return this.setMatrix(TransformCalculator.concatMatrix(this.getTransform(this.layerId), transform));
	}

	flush(): void {
		this.init();
		this.getLayerBuilder().setTransForm(DrawAPIUtils.complement(this.matrix, TRANSFORM_DEFAULT)).commit().commit();
	}

	protected beforeCommit(): void {
		if (this.matrix == null) {
			return;
		}
		// console.log(JSON.stringify(this.matrix));
		this.getLayerBuilder().setTransForm(this.matrix).commit().commit();
		this.matrix = null;
	}

	protected beforeCancel(duration: boolean): void {
		// this.matrix = null;
		// 現在処理なし
	}

	protected afterCommit(duration: boolean): void {
		// 現在処理なし
	}

	protected afterCancel(): void {
		this.matrix = null;
	}
}

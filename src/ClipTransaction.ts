import {AbstractLayerTransaction} from "./AbstractLayerTransaction";
import {TransformMap} from "./TransformMap";
import {TransformCalculator} from "./TransformCalculator";
import {history, structures} from "@s2study/draw-api";
import PathItem = structures.PathItem;
import DrawHistory = history.DrawHistory;
import DrawHistoryEditSession = history.DrawHistoryEditSession;
import MoveTo = structures.MoveTo;
import ArcTo = structures.ArcTo;
import QuadraticCurveTo = structures.QuadraticCurveTo;
import LineTo = structures.LineTo;
import BezierCurveTo = structures.BezierCurveTo;
import DrawLayerMomentBuilder = history.DrawLayerMomentBuilder;
import {ClipFactory} from "@s2study/draw-api/lib/structures/Clip";
import {MoveToFactory} from "@s2study/draw-api/lib/structures/MoveTo";
import {ArcToFactory} from "@s2study/draw-api/lib/structures/ArcTo";
import {QuadraticCurveToFactory} from "@s2study/draw-api/lib/structures/QuadraticCurveTo";
import {LineToFactory} from "@s2study/draw-api/lib/structures/LineTo";
import {BezierCurveToFactory} from "@s2study/draw-api/lib/structures/BezierCurveTo";
import {IPathTransaction} from "./index";

export class ClipTransaction extends AbstractLayerTransaction implements IPathTransaction {

	private path: PathItem[] = [];
	private savedPath: PathItem[] = [];

	constructor(
		session: DrawHistoryEditSession,
		history: DrawHistory,
		layerId: string,
		editLayerId: string,
		transformMap: TransformMap
	) {
		super(session, history, layerId, editLayerId, transformMap);
	}

	moveTo(
		x: number,
		y: number
	): ClipTransaction {

		this.init();
		let transform = this.getTransform(this.layerId);
		let invert = TransformCalculator.invert(transform);
		let point = TransformCalculator.transform(invert, x, y);
		this.path.push(MoveToFactory.createInstance(
			point.x, point.y
		));
		return this;
	}

	arcTo(
		x1: number,
		y1: number,
		x2: number,
		y2: number,
		radius: number
	): ClipTransaction {

		this.init();
		let transform = this.getTransform(this.layerId);
		let invert = TransformCalculator.invert(transform);
		let point1 = TransformCalculator.transform(invert, x1, y1);
		let point2 = TransformCalculator.transform(invert, x2, y2);

		this.path.push(ArcToFactory.createInstance(
			point1.x, point1.y, point2.x, point2.y, radius
		));
		return this;
	}

	quadraticCurveTo(
		cpx: number,
		cpy: number,
		x: number,
		y: number
	): ClipTransaction {

		this.init();
		let transform = this.getTransform(this.layerId);
		let invert = TransformCalculator.invert(transform);
		let point1 = TransformCalculator.transform(invert, cpx, cpy);
		let point2 = TransformCalculator.transform(invert, x, y);

		this.path.push(QuadraticCurveToFactory.createInstance(
			point1.x, point1.y, point2.x, point2.y
		));
		return this;
	}

	lineTo(
		x: number,
		y: number
	): ClipTransaction {

		this.init();
		let transform = this.getTransform(this.layerId);
		let invert = TransformCalculator.invert(transform);
		let point1 = TransformCalculator.transform(invert, x, y);
		this.path.push(LineToFactory.createInstance(
			point1.x, point1.y
		));
		return this;
	}

	bezierCurveTo(
		cpx1: number,
		cpy1: number,
		cpx2: number,
		cpy2: number,
		x: number,
		y: number
	): ClipTransaction {

		this.init();
		let transform = this.getTransform(this.layerId);
		let invert = TransformCalculator.invert(transform);
		let point1 = TransformCalculator.transform(invert, cpx1, cpy1);
		let point2 = TransformCalculator.transform(invert, cpx2, cpy2);
		let point3 = TransformCalculator.transform(invert, x, y);

		this.path.push(BezierCurveToFactory.createInstance(
			point1.x, point1.y, point2.x, point2.y, point3.x, point3.y
		));
		return this;
	}

	flush(): void {
		this.init();
		this.doUpdate(
			this.getEditBuilder().setTransForm(this.getTransform(this.layerId)),
			this.path
		);
	}

	restoreSavePoint(): void {
		super.restoreSavePoint();
		this.path = [];
	}

	setSavePoint(): void {
		super.setSavePoint();
		Array.prototype.push.apply(this.savedPath, this.path);
		this.path = [];
	}

	protected beforeCommit(duration: boolean): void {
		Array.prototype.push.apply(this.savedPath, this.path);
		this.doUpdate(this.getLayerBuilder(), this.savedPath);
		this.savedPath = [];
		this.path = [];
		super.setSavePoint();
		super.beforeCommit(duration);
	}

	protected afterCancel(): void {
		this.savedPath = [];
		this.path = [];
		super.setSavePoint();
	}

	private doUpdate(layerBuilder: DrawLayerMomentBuilder,
	path1: PathItem[]): void {
		if (path1 == null || path1.length === 0) {
			return;
		}
		layerBuilder.setClip(ClipFactory.createInstance(path1))
		.commit().commit();
	}
}
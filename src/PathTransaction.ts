import {TransformMap} from "./TransformMap";
import {AbstractLayerTransaction} from "./AbstractLayerTransaction";
import {TransformCalculator} from "./TransformCalculator";
import {history, structures} from "@s2study/draw-api";
import Fill = structures.Fill;
import Dash = structures.Dash;
import StrokeStyle = structures.StrokeStyle;
import PathItem = structures.PathItem;
import DrawHistoryEditSession = history.DrawHistoryEditSession;
import DrawHistory = history.DrawHistory;
import ColorStop = structures.ColorStop;
import MoveTo = structures.MoveTo;
import ArcTo = structures.ArcTo;
import LineTo = structures.LineTo;
import QuadraticCurveTo = structures.QuadraticCurveTo;
import BezierCurveTo = structures.BezierCurveTo;
import DrawLayerMomentBuilder = history.DrawLayerMomentBuilder;
import Graphic = structures.Graphic;
import GraphicsDraw = structures.GraphicsDraw;
import {StrokeStyleFactory} from "@s2study/draw-api/lib/structures/StrokeStyle";
import {DashFactory} from "@s2study/draw-api/lib/structures/Dash";
import {FillFactory} from "@s2study/draw-api/lib/structures/Fill";
import {LinerGradientFactory} from "@s2study/draw-api/lib/structures/LinerGradient";
import {RadialGradientFactory} from "@s2study/draw-api/lib/structures/RadialGradient";
import {MoveToFactory} from "@s2study/draw-api/lib/structures/MoveTo";
import {ArcToFactory} from "@s2study/draw-api/lib/structures/ArcTo";
import {LineToFactory} from "@s2study/draw-api/lib/structures/LineTo";
import {QuadraticCurveToFactory} from "@s2study/draw-api/lib/structures/QuadraticCurveTo";
import {BezierCurveToFactory} from "@s2study/draw-api/lib/structures/BezierCurveTo";
import {GraphicsDrawFactory} from "@s2study/draw-api/lib/structures/GraphicsDraw";
import {GraphicFactory} from "@s2study/draw-api/lib/structures/Graphic";
import {StrokeFactory} from "@s2study/draw-api/lib/structures/Stroke";
import {TRANSFORM_DEFAULT} from "@s2study/draw-api/lib/structures/Transform";
export class PathTransaction extends AbstractLayerTransaction {

	private fill: Fill;
	private strokeFill: Fill;
	private dash: Dash;
	private style: StrokeStyle;

	private path: PathItem[] = [];
	private savedPath: PathItem[] = [];
	private compositeOperation: number;

	constructor(
		session: DrawHistoryEditSession,
		history: DrawHistory,
		layerId: string,
		editLayerId: string,
		transformMap: TransformMap
	) {
		super(session, history, layerId, editLayerId, transformMap);
	}

	setFill(color: number): PathTransaction {
		this.init();
		this.fill = FillFactory.createInstance(color);
		return this;
	}

	setFillLinerGradient(
		x0: number,
		y0: number,
		x1: number,
		y1: number,
		colorStops?: ColorStop[]
	): PathTransaction {
		this.init();

		let transform = this.getTransform(this.layerId);
		let invert = TransformCalculator.invert(transform);
		let point1 = TransformCalculator.transform(invert, x0, y0);
		let point2 = TransformCalculator.transform(invert, x1, y1);
		this.fill = FillFactory.createInstance(null, LinerGradientFactory.createInstance(
			point1.x,
			point1.y,
			point2.x,
			point2.y,
			colorStops
		));
		return this;
	}

	setFillRadialGradient(
		x0: number,
		y0: number,
		r0: number,
		x1: number,
		y1: number,
		r1: number,
		colorStops?: ColorStop[]
	): PathTransaction {
		this.init();
		let transform = this.getTransform(this.layerId);
		let invert = TransformCalculator.invert(transform);
		let point1 = TransformCalculator.transform(invert, x0, y0);
		let point2 = TransformCalculator.transform(invert, x1, y1);
		this.fill = FillFactory.createInstance(null, null, RadialGradientFactory.createInstance(
			point1.x,
			point1.y,
			r0,
			point2.x,
			point2.y,
			r1,
			colorStops
		));
		return this;
	}

	setStrokeColor(color: number): PathTransaction {
		this.strokeFill = FillFactory.createInstance(color);
		return this;
	}

	setStrokeDash(
		segments?: number[],
		offset?: number
	): PathTransaction {
		this.dash = DashFactory.createInstance(
			segments,
			offset
		);
		return this;
	}

	setStrokeStyle(thickness?: number,
		caps?: number,
		joints?: number,
		miterLimit?: number,
		ignoreScale?: number
	): PathTransaction {
		this.style = StrokeStyleFactory.createInstance(
			thickness,
			caps,
			joints,
			miterLimit,
			ignoreScale
		);
		return this;
	}

	moveTo(
		x: number,
		y: number
	): PathTransaction {
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
	): PathTransaction {
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

	lineTo(
		x: number,
		y: number
	): PathTransaction {
		this.init();
		let transform = this.getTransform(this.layerId);
		let invert = TransformCalculator.invert(transform);
		let point = TransformCalculator.transform(invert, x, y);
		this.path.push(LineToFactory.createInstance(
			point.x, point.y
		));
		return this;
	}

	quadraticCurveTo(
		cpx: number,
		cpy: number,
		x: number,
		y: number
	): PathTransaction {
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

	bezierCurveTo(
		cpx1: number,
		cpy1: number,
		cpx2: number,
		cpy2: number,
		x: number,
		y: number
	): PathTransaction {
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

	setCompositeOperation(compositeOperation: number): PathTransaction {
		this.init();
		this.compositeOperation = compositeOperation;
		this.doUpdate(this.getEditBuilder(), this.path);
		return this;
	}

	setSavePoint(): void {
		super.setSavePoint();
		Array.prototype.push.apply(this.savedPath, this.path);
		this.path = [];
	}

	restoreSavePoint(): void {
		super.restoreSavePoint();
		this.path = [];
	}

	protected beforeCommit(duration: boolean): void {
		Array.prototype.push.apply(this.savedPath, this.path);
		this.doUpdate(this.getLayerBuilder(), this.savedPath);
		this.savedPath = [];
		this.path = [];
		super.beforeCommit(duration);
	}

	protected afterCancel(): void {
		this.savedPath = [];
		this.path = [];
		super.setSavePoint();
	}

	private doUpdate(
		layerBuilder: DrawLayerMomentBuilder,
		path1: PathItem[]
	): void {
		if (path1 == null || path1.length === 0) {
			return;
		}
		layerBuilder.addDraw(GraphicsDrawFactory.createInstance([
			GraphicFactory.createInstance(
				path1,
				this.fill,
				StrokeFactory.createInstance(
					this.strokeFill,
					this.dash,
					this.style
				)
			)],
			TRANSFORM_DEFAULT,
			this.compositeOperation
		)).commit().commit();
	}

}

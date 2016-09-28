import drawchat from "@s2study/draw-api";

import ColorStop = drawchat.structures.ColorStop;
import Fill = drawchat.structures.Fill;
import Stroke = drawchat.structures.Stroke;
import PathItem = drawchat.structures.PathItem;
import MoveTo = drawchat.structures.MoveTo;
import ArcTo = drawchat.structures.ArcTo;
import QuadraticCurveTo = drawchat.structures.QuadraticCurveTo;
import LineTo = drawchat.structures.LineTo;
import BezierCurveTo = drawchat.structures.BezierCurveTo;
import DrawLayerMomentBuilder = drawchat.history.DrawLayerMomentBuilder;
import Dash = drawchat.structures.Dash;
import StrokeStyle = drawchat.structures.StrokeStyle;
import Graphic = drawchat.structures.Graphic;
import DrawHistory = drawchat.history.DrawHistory;
import DrawHistoryEditSession = drawchat.history.DrawHistoryEditSession;
import Transform = drawchat.structures.Transform;
import DrawPathTransaction = drawchat.updater.DrawPathTransaction;
import {TransformMap} from "./TransformMap";
import {AbstractLayerTransaction} from "./AbstractLayerTransaction";
import {TransformCalculator} from "./TransformCalculator";
export class Path extends AbstractLayerTransaction implements DrawPathTransaction {

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
		transformMap: TransformMap) {
		super(session, history, layerId, editLayerId, transformMap);
	}

	setFill(color: string): DrawPathTransaction {
		this.init();
		this.fill = <Fill>{
			color: color
		};
		return this;
	}

	setFillLinerGradient(
		x0: number,
		y0: number,
		x1: number,
		y1: number,
		colorStops?: ColorStop[]): DrawPathTransaction {
		this.init();
		let transform = this.getTransform(this.layerId);
		let invert = TransformCalculator.invert(transform);
		let point1 = TransformCalculator.transform(invert, x0, y0);
		let point2 = TransformCalculator.transform(invert, x1, y1);
		this.fill = <Fill>{
			linerGradient: {
				x0: point1.x,
				y0: point1.y,
				x1: point2.x,
				y1: point2.y,
				colorStops: colorStops
			}
		};
		return this;
	}

	setFillRadialGradient(
		x0: number,
		y0: number,
		r0: number,
		x1: number,
		y1: number,
		r1: number,
		colorStops?: ColorStop[]): DrawPathTransaction {
		this.init();
		let transform = this.getTransform(this.layerId);
		let invert = TransformCalculator.invert(transform);
		let point1 = TransformCalculator.transform(invert, x0, y0);
		let point2 = TransformCalculator.transform(invert, x1, y1);
		this.fill = <Fill>{
			radialGradient: {
				x0: point1.x,
				y0: point1.y,
				r0: r0,
				x1: point2.x,
				y1: point2.y,
				r1: r1,
				colorStops: colorStops
			}
		};
		return this;
	}

	setStrokeColor(color: string): DrawPathTransaction {
		this.strokeFill = <Fill>{
			color: color
		};
		return this;
	}

	setStrokeDash(
		segments?: number[],
		offset?: number
	): DrawPathTransaction {
		this.dash = {
			segments: segments,
			offset: offset
		};
		return this;
	}

	setStrokeStyle(
		thickness?: number,
		caps?: number,
		joints?: number,
		miterLimit?: number,
		ignoreScale?: number
	): DrawPathTransaction {
		this.style = {
			thickness: thickness,
			caps: caps,
			joints: joints,
			miterLimit: miterLimit,
			ignoreScale: ignoreScale
		};
		return this;
	}

	moveTo(
		x: number,
		y: number
	): DrawPathTransaction {
		this.init();
		let transform = this.getTransform(this.layerId);
		let invert = TransformCalculator.invert(transform);
		let point = TransformCalculator.transform(invert, x, y);

		this.path.push(
			<MoveTo>{
				type: 0,
				x: point.x,
				y: point.y
			}
		);
		return this;
	}

	arcTo(
		x1: number,
		y1: number,
		x2: number,
		y2: number,
		radius: number
	): DrawPathTransaction {
		this.init();
		let transform = this.getTransform(this.layerId);
		let invert = TransformCalculator.invert(transform);
		let point1 = TransformCalculator.transform(invert, x1, y1);
		let point2 = TransformCalculator.transform(invert, x2, y2);
		this.path.push(
			<ArcTo>{
				type: 1,
				x1: point1.x,
				y1: point1.y,
				x2: point2.x,
				y2: point2.y,
				radius: radius
			}
		);
		return this;
	}

	lineTo(
		x: number,
		y: number
	): DrawPathTransaction {
		this.init();
		let transform = this.getTransform(this.layerId);
		let invert = TransformCalculator.invert(transform);
		let point = TransformCalculator.transform(invert, x, y);
		this.path.push(
			<LineTo>{
				type: 3,
				x: point.x,
				y: point.y
			}
		);
		return this;
	}

	quadraticCurveTo(
		cpx: number,
		cpy: number,
		x: number,
		y: number
	): DrawPathTransaction {
		this.init();

		let transform = this.getTransform(this.layerId);
		let invert = TransformCalculator.invert(transform);
		let point1 = TransformCalculator.transform(invert, cpx, cpy);
		let point2 = TransformCalculator.transform(invert, x, y);

		this.path.push(
			<QuadraticCurveTo>{
				type: 2,
				cpx: point1.x,
				cpy: point1.y,
				x: point2.x,
				y: point2.y
			}
		);
		return this;
	}

	bezierCurveTo(
		cpx1: number,
		cpy1: number,
		cpx2: number,
		cpy2: number,
		x: number,
		y: number
	): DrawPathTransaction {
		this.init();
		let transform = this.getTransform(this.layerId);
		let invert = TransformCalculator.invert(transform);
		let point1 = TransformCalculator.transform(invert, cpx1, cpy1);
		let point2 = TransformCalculator.transform(invert, cpx2, cpy2);
		let point3 = TransformCalculator.transform(invert, x, y);
		this.path.push(
			<BezierCurveTo>{
				type: 4,
				cpx1: point1.x,
				cpy1: point1.y,
				cpx2: point2.x,
				cpy2: point2.y,
				x: point3.x,
				y: point3.y
			}
		);
		return this;
	}

	flush(): void {
		this.init();
		this.doUpdate(
			this.getEditBuilder().setTransForm(this.getTransform(this.layerId)),
			this.path
		);
	}

	setCompositeOperation(compositeOperation: number): drawchat.updater.DrawPathTransaction {
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
		layerBuilder.addDraw(
			<drawchat.structures.GraphicsDraw>{
				compositeOperation: this.compositeOperation,
				graphics: [<Graphic>{
					fill: this.fill,
					stroke: {
						fillStyle: this.strokeFill,
						dash: this.dash,
						style: this.style
					},
					path: path1
				}]
			})
			.commit().commit();
	}

}

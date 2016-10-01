import * as drawchat from "@s2study/draw-api";

import TextTransaction = drawchat.updater.TextTransaction;
import DrawHistory = drawchat.history.DrawHistory;
import DrawHistoryEditSession = drawchat.history.DrawHistoryEditSession;
import Fill = drawchat.structures.Fill;
import Stroke = drawchat.structures.Stroke;
import TextDraw = drawchat.structures.TextDraw;
import DrawLayerMomentBuilder = drawchat.history.DrawLayerMomentBuilder;
import ColorStop = drawchat.structures.ColorStop;

import {AbstractLayerTransaction} from "./AbstractLayerTransaction";
import {TransformMap} from "./TransformMap";
import {TransformCalculator} from "./TransformCalculator";
export class Text extends AbstractLayerTransaction implements TextTransaction {

	private x: number;
	private y: number;
	private fill: Fill;
	private stroke: Stroke;
	private align: string;
	private baseline: string;
	private text: string;
	private fontFamily: string;
	private size: number;
	private weight: number;
	private style: number;
	private compositeOperation: number;

	constructor(session: DrawHistoryEditSession,
				history: DrawHistory,
				layerId: string,
				editLayerId: string,
				transformMap: TransformMap) {
		super(session, history, layerId, editLayerId, transformMap);
	}

	setFill(color: string): TextTransaction {
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
		colorStops?: ColorStop[]): TextTransaction {
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
		colorStops?: ColorStop[]): TextTransaction {
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

	setStrokeColor(color: string): TextTransaction {
		this.stroke = {
			fillStyle: {
				color: color
			}
		};
		return this;
	}

	push(text: string): TextTransaction {
		this.init();
		this.text = this.text == null ? text : this.text + text;
		return this;
	}

	setBaseline(baseline?: string): TextTransaction {
		this.baseline = baseline;
		return this;
	}

	setAlign(align?: string): TextTransaction {
		this.align = align;
		return this;
	}

	setPosition(x: number,
				y: number): TextTransaction {
		this.init();
		let transform = this.getTransform(this.layerId);
		let invert = TransformCalculator.invert(transform);
		let point1 = TransformCalculator.transform(invert, x, y);

		this.x = point1.x;
		this.y = point1.y;
		return this;
	}

	setFontFamily(fontFamily: string): TextTransaction {
		this.fontFamily = fontFamily;
		return this;
	}

	setSize(size: number): TextTransaction {
		this.size = size;
		return this;
	}

	setWeight(weight: number): TextTransaction {
		this.weight = weight;
		return this;
	}

	setStyle(style: number): TextTransaction {
		this.style = style;
		return this;
	}

	setCompositeOperation(compositeOperation: number): drawchat.updater.TextTransaction {
		this.compositeOperation = compositeOperation;
		return this;
	}

	flush(): void {
		this.init();
		this.doUpdate(this.getEditBuilder());
	}

	protected beforeCommit(duration: boolean): void {
		this.doUpdate(this.getLayerBuilder());
		super.beforeCommit(duration);
	}

	protected afterCancel(): void {
		this.x = undefined;
		this.y = undefined;
		this.fill = undefined;
		this.stroke = undefined;
		this.align = undefined;
		this.baseline = undefined;
		this.text = undefined;
		this.fontFamily = undefined;
		this.size = undefined;
		this.weight = undefined;
		this.style = undefined;
		this.compositeOperation = undefined;
	}

	private doUpdate(layerBuilder: DrawLayerMomentBuilder): void {
		if (this.text == null || this.text.length === 0) {
			return;
		}
		layerBuilder.addDraw(
			<TextDraw>{
				compositeOperation: this.compositeOperation,
				text: {
					x: this.x,
					y: this.y,
					fill: this.fill,
					stroke: this.stroke,
					align: this.align,
					baseline: this.baseline,
					text: this.text,
					fontFamily: this.fontFamily,
					size: this.size,
					weight: this.weight,
					style: this.style
				}
			})
			.commit().commit();
	}
}

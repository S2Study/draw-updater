import {AbstractLayerTransaction} from "./AbstractLayerTransaction";
import {TransformMap} from "./TransformMap";
import {TransformCalculator} from "./TransformCalculator";
import {history, structures} from "@s2study/draw-api";
import Fill = structures.Fill;
import Stroke = structures.Stroke;
import DrawHistoryEditSession = history.DrawHistoryEditSession;
import DrawHistory = history.DrawHistory;
import ColorStop = structures.ColorStop;
import DrawLayerMomentBuilder = history.DrawLayerMomentBuilder;
import TextDraw = structures.TextDraw;
import {FillFactory} from "@s2study/draw-api/lib/structures/Fill";
import {StrokeFactory} from "@s2study/draw-api/lib/structures/Stroke";
import {TextDrawFactory} from "@s2study/draw-api/lib/structures/TextDraw";
import {TextFactory} from "@s2study/draw-api/lib/structures/Text";
export class TextTransaction extends AbstractLayerTransaction {

	private x: number | undefined;
	private y: number | undefined;
	private fill: Fill | undefined;
	private stroke: Stroke | undefined;
	// private align: string;
	// private baseline: string;
	private text: string | undefined;
	private fontFamily: string | undefined;
	private size: number | undefined;
	private weight: number | undefined;
	private style: number | undefined;
	private compositeOperation: number | undefined;

	constructor(session: DrawHistoryEditSession,
				history: DrawHistory,
				layerId: string,
				editLayerId: string,
				transformMap: TransformMap) {
		super(session, history, layerId, editLayerId, transformMap);
	}

	setFill(color: number): TextTransaction {
		// this.init();
		this.fill = FillFactory.createInstance(color);
		// this.doUpdate(this.getEditBuilder());
		return this;
	}

	setFillLinerGradient(x0: number,
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
		// this.doUpdate(this.getEditBuilder());
		return this;
	}

	setFillRadialGradient(x0: number,
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
		// this.doUpdate(this.getEditBuilder());
		return this;
	}

	setStrokeColor(color: number): TextTransaction {
		// this.init();
		this.stroke = StrokeFactory.createInstance(FillFactory.createInstance(color));
		// this.doUpdate(this.getEditBuilder());
		return this;
	}

	push(text: string): TextTransaction {
		this.init();
		this.text = this.text == null ? text : this.text + text;
		// this.doUpdate(this.getEditBuilder());
		return this;
	}

	// setBaseline(baseline?: string): Text {
	// 	// this.init();
	// 	this.baseline = DrawAPIUtils.complementString(baseline, "");
	// 	// this.doUpdate(this.getEditBuilder());
	// 	return this;
	// }
	//
	// setAlign(align?: string): Text {
	// 	// this.init();
	// 	this.align = align;
	// 	// this.doUpdate(this.getEditBuilder());
	// 	return this;
	// }

	setPosition(x: number,
				y: number): TextTransaction {
		this.init();
		let transform = this.getTransform(this.layerId);
		let invert = TransformCalculator.invert(transform);
		let point1 = TransformCalculator.transform(invert, x, y);

		this.x = point1.x;
		this.y = point1.y;

		// this.doUpdate(this.getEditBuilder());
		return this;
	}

	setFontFamily(fontFamily: string): TextTransaction {
		// this.init();
		this.fontFamily = fontFamily;
		// this.doUpdate(this.getEditBuilder());
		return this;
	}

	setSize(size: number): TextTransaction {
		// this.init();
		this.size = size;
		// this.doUpdate(this.getEditBuilder());
		return this;
	}

	setWeight(weight: number): TextTransaction {
		// this.init();
		this.weight = weight;
		// this.doUpdate(this.getEditBuilder());
		return this;
	}

	setStyle(style: number): TextTransaction {
		// this.init();
		this.style = style;
		// this.doUpdate(this.getEditBuilder());
		return this;
	}

	setCompositeOperation(compositeOperation: number): TextTransaction {
		// this.init();
		this.compositeOperation = compositeOperation;
		// this.doUpdate(this.getEditBuilder());
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
			TextDrawFactory.createInstance(
				TextFactory.createInstance(
					this.text,
					this.x,
					this.y,
					this.size,
					this.fill,
					this.stroke,
					this.fontFamily,
					this.weight,
					this.style
				),
				null,
				this.compositeOperation
		))
		.commit().commit();
	}
}

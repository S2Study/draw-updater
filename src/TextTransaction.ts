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
import {LinerGradientFactory} from "@s2study/draw-api/lib/structures/LinerGradient";
import {RadialGradientFactory} from "@s2study/draw-api/lib/structures/RadialGradient";
export class TextTransaction extends AbstractLayerTransaction {

	private x: number | undefined;
	private y: number | undefined;
	private fill: Fill | undefined;
	private stroke: Stroke | undefined;
	private text: string | undefined;
	private fontFamily: string | undefined;
	private size: number | undefined;
	private weight: number | undefined;
	private style: number | undefined;
	private compositeOperation: number | undefined;

	constructor(
		session: DrawHistoryEditSession,
		history: DrawHistory,
		layerId: string,
		editLayerId: string,
		transformMap: TransformMap
	) {
		super(session, history, layerId, editLayerId, transformMap);
	}

	setFill(color: number): TextTransaction {
		this.fill = FillFactory.createInstance(color);
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

		this.fill = FillFactory.createInstance(null, LinerGradientFactory.createInstance(
			point1.x,
			point1.y,
			point2.x,
			point2.y,
			colorStops
		));
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
		this.fill = FillFactory.createInstance( null, null, RadialGradientFactory.createInstance(
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

	setStrokeColor(color: number): TextTransaction {
		this.stroke = StrokeFactory.createInstance(FillFactory.createInstance(color));
		return this;
	}

	push(text: string): TextTransaction {
		this.init();
		this.text = this.text == null ? text : this.text + text;
		return this;
	}

	setPosition(
		x: number,
		y: number
	): TextTransaction {
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

	setCompositeOperation(compositeOperation: number): TextTransaction {
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

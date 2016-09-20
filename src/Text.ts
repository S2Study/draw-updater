import TextTransaction = drawchat.updater.TextTransaction;
import DrawHistory = drawchat.core.DrawHistory;
import DrawHistoryEditSession = drawchat.core.DrawHistoryEditSession;
import Fill = drawchat.Fill;
import Stroke = drawchat.Stroke;
import TextDraw = drawchat.TextDraw;
import DrawLayerMomentBuilder = drawchat.core.DrawLayerMomentBuilder;

import {AbstractLayerTransaction} from "./AbstractLayerTransaction";
import {TransformMap} from "./TransformMap";
import {TransformCalculator} from "./TransformCalculator";
export class Text extends AbstractLayerTransaction implements TextTransaction{

	private x:number;
	private y:number;
	private fill:Fill;
	private stroke:Stroke;
	private align:string;
	private baseline:string;
	private text:string;
	private fontFamily:string;
	private size:number;
	private weight:number;
	private style:number;
	private compositeOperation:number;

	constructor(
		session:DrawHistoryEditSession,
		history:DrawHistory,
		layerId:string,
		editLayerId:string,
		transformMap:TransformMap
	){
		super(session,history,layerId,editLayerId,transformMap);
	}

	setFill(
		color:string
	):TextTransaction {
		// this.init();
		this.fill = <Fill>{
			color:color
		};
		// this.doUpdate(this.getEditBuilder());
		return this;
	}

	setFillLinerGradient(
		x0:number,
		y0:number,
		x1:number,
		y1:number,
		colorStops?:drawchat.ColorStop[]
	):TextTransaction {
		this.init();

		let transform = this.getTransform(this.layerId);
		let invert = TransformCalculator.invert(transform);
		let point1 = TransformCalculator.transform(invert,x0,y0);
		let point2 = TransformCalculator.transform(invert,x1,y1);

		this.fill = <Fill>{
			linerGradient:{
				x0:point1.x,
				y0:point1.y,
				x1:point2.x,
				y1:point2.y,
				colorStops:colorStops
			}
		};
		// this.doUpdate(this.getEditBuilder());
		return this;
	}

	setFillRadialGradient(
		x0:number,
		y0:number,
		r0:number,
		x1:number,
		y1:number,
		r1:number,
		colorStops?:drawchat.ColorStop[]
	):TextTransaction {
		this.init();

		let transform = this.getTransform(this.layerId);
		let invert = TransformCalculator.invert(transform);
		let point1 = TransformCalculator.transform(invert,x0,y0);
		let point2 = TransformCalculator.transform(invert,x1,y1);

		this.fill = <Fill>{
			radialGradient:{
				x0:point1.x,
				y0:point1.y,
				r0:r0,
				x1:point2.x,
				y1:point2.y,
				r1:r1,
				colorStops:colorStops
			}
		};
		// this.doUpdate(this.getEditBuilder());
		return this;
	}

	setStrokeColor(
		color:string
	):TextTransaction {
		// this.init();
		this.stroke ={
			fillStyle:{
				color:color
			}
		};
		// this.doUpdate(this.getEditBuilder());
		return this;
	}

	push(
		text:string
	):TextTransaction {
		this.init();
		this.text = this.text == null ? text : this.text + text;
		// this.doUpdate(this.getEditBuilder());
		return this;
	}

	setBaseline(
		baseline?:string
	):TextTransaction {
		// this.init();
		this.baseline = baseline;
		// this.doUpdate(this.getEditBuilder());
		return this;
	}

	setAlign(
		align?:string
	):TextTransaction {
		// this.init();
		this.align = align;
		// this.doUpdate(this.getEditBuilder());
		return this;
	}

	setPosition(
		x:number,
		y:number
	):TextTransaction {
		this.init();
		let transform = this.getTransform(this.layerId);
		let invert = TransformCalculator.invert(transform);
		let point1 = TransformCalculator.transform(invert,x,y);

		this.x = point1.x;
		this.y = point1.y;

		// this.doUpdate(this.getEditBuilder());
		return this;
	}

	setFontFamily(fontFamily:string):TextTransaction {
		// this.init();
		this.fontFamily = fontFamily;
		// this.doUpdate(this.getEditBuilder());
		return this;
	}

	setSize(size:number):TextTransaction {
		// this.init();
		this.size = size;
		// this.doUpdate(this.getEditBuilder());
		return this;
	}

	setWeight(weight:number):TextTransaction {
		// this.init();
		this.weight = weight;
		// this.doUpdate(this.getEditBuilder());
		return this;
	}

	setStyle(style:number):TextTransaction {
		// this.init();
		this.style = style;
		// this.doUpdate(this.getEditBuilder());
		return this;
	}

	setCompositeOperation(compositeOperation: number): drawchat.updater.TextTransaction {
		// this.init();
		this.compositeOperation = compositeOperation;
		// this.doUpdate(this.getEditBuilder());
		return this;
	}

	flush(): void {
		this.init();
		this.doUpdate(this.getEditBuilder());
	}

	protected beforeCommit(duration:boolean):void {
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

	private doUpdate(layerBuilder:DrawLayerMomentBuilder):void{
		if(this.text == null || this.text.length === 0){
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
					fontFamily:this.fontFamily,
					size:this.size,
					weight:this.weight,
					style:this.style
				}
			})
			.commit().commit();
	}
}

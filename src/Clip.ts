import ClipTransaction = drawchat.updater.ClipTransaction;
import PathItem = drawchat.PathItem;
import MoveTo = drawchat.MoveTo;
import ArcTo = drawchat.ArcTo;
import QuadraticCurveTo = drawchat.QuadraticCurveTo;
import LineTo = drawchat.LineTo;
import BezierCurveTo = drawchat.BezierCurveTo;
import Draw = drawchat.Draw;
import DrawLayerMomentBuilder = drawchat.core.DrawLayerMomentBuilder;
import DrawHistory = drawchat.core.DrawHistory;
import DrawHistoryEditSession = drawchat.core.DrawHistoryEditSession;
import Transform = drawchat.Transform;

import {AbstractLayerTransaction} from "./AbstractLayerTransaction";
import {TransformMap} from "./TransformMap";
import {TransformCalculator} from "./TransformCalculator";
export class Clip extends AbstractLayerTransaction implements ClipTransaction{

	private path:PathItem[] = [];
	private savedPath:PathItem[] = [];
	// private transformMap:TransformMap;
	// private transform:Transform;

	constructor(
		session:DrawHistoryEditSession,
		history:DrawHistory,
		layerId:string,
		editLayerId:string,
		transformMap:TransformMap
	){
		super(session,history,layerId,editLayerId,transformMap);
		// this.transformMap = transformMap;
	}

	moveTo(
		x:number,
		y:number
	):ClipTransaction {
		this.init();
		// this.transformMap.updateMap(this.history);
		let transform = this.getTransform(this.layerId);
		let invert = TransformCalculator.invert(transform);
		let point = TransformCalculator.transform(invert,x,y);

		this.path.push(
			<MoveTo>{
				type:0,
				x:point.x,
				y:point.y
			}
		);
		// this.doUpdate(
		// 	this.getEditBuilder().setTransForm(transform),
		// 	this.path
		// );
		return this;
	}

	arcTo(
		x1:number,
		y1:number,
		x2:number,
		y2:number,
		radius:number
	):ClipTransaction {
		this.init();
		// this.transformMap.updateMap(this.history);
		let transform = this.getTransform(this.layerId);
		let invert = TransformCalculator.invert(transform);

		let point1 = TransformCalculator.transform(invert,x1,y1);
		let point2 = TransformCalculator.transform(invert,x2,y2);

		this.path.push(
			<ArcTo>{
				type:1,
				x1:point1.x,
				y1:point1.y,
				x2:point2.x,
				y2:point2.y,
				radius:radius
			}
		);
		// this.doUpdate(
		// 	this.getEditBuilder().setTransForm(transform),
		// 	this.path
		// );
		return this;
	}

	quadraticCurveTo(
		cpx:number,
		cpy:number,
		x:number,
		y:number
	):ClipTransaction {
		this.init();
		// this.transformMap.updateMap(this.history);

		let transform = this.getTransform(this.layerId);
		let invert = TransformCalculator.invert(transform);
		let point1 = TransformCalculator.transform(invert,cpx,cpy);
		let point2 = TransformCalculator.transform(invert,x,y);

		this.path.push(
			<QuadraticCurveTo>{
				type:2,
				cpx:point1.x,
				cpy:point1.y,
				x:point2.x,
				y:point2.y
			}
		);
		// this.doUpdate(
		// 	this.getEditBuilder().setTransForm(transform),
		// 	this.path
		// );
		return this;
	}

	lineTo(
		x:number,
		y:number
	):ClipTransaction {
		this.init();
		// this.transformMap.updateMap(this.history);

		let transform = this.getTransform(this.layerId);
		let invert = TransformCalculator.invert(transform);
		let point1 = TransformCalculator.transform(invert,x,y);

		this.path.push(
			<LineTo>{
				type:3,
				x:point1.x,
				y:point1.y
			}
		);
		// this.doUpdate(
		// 	this.getEditBuilder().setTransForm(transform),
		// 	this.path
		// );
		return this;
	}

	bezierCurveTo(
		cpx1:number,
		cpy1:number,
		cpx2:number,
		cpy2:number,
		x:number,
		y:number
	):ClipTransaction {
		this.init();
		// this.transformMap.updateMap(this.history);
		let transform = this.getTransform(this.layerId);
		let invert = TransformCalculator.invert(transform);
		let point1 = TransformCalculator.transform(invert,cpx1,cpy1);
		let point2 = TransformCalculator.transform(invert,cpx2,cpy2);
		let point3 = TransformCalculator.transform(invert,x,y);

		this.path.push(
			<BezierCurveTo>{
				type:4,
				cpx1:point1.x,
				cpy1:point1.y,
				cpx2:point2.x,
				cpy2:point2.y,
				x:point3.x,
				y:point3.y
			}
		);
		// this.doUpdate(
		// 	this.getEditBuilder().setTransForm(transform),
		// 	this.path
		// );
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

	protected beforeCommit(duration:boolean):void {
		Array.prototype.push.apply(this.savedPath, this.path);
		this.doUpdate(this.getLayerBuilder(),this.savedPath);
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

	private doUpdate(
		layerBuilder:DrawLayerMomentBuilder,
		path1:PathItem[]
	):void{
		if(path1 == null || path1.length === 0){
			return;
		}
		layerBuilder.setClip(
		<drawchat.Clip>{
			path:path1
		})
		.commit().commit();
	}
}
import {history, structures} from "@s2study/draw-api";

import Transform = structures.Transform;
import DrawHistory = history.DrawHistory;
import DrawMoment = history.DrawMoment;
import {TransformFactory} from "@s2study/draw-api/lib/structures/Transform";
export class TransformMap {

	static TRANSFORM_DEFAULT: Transform = TransformFactory.createInstance();

	private historyNumber: number = -1;
	private layerMap: { [key: string]: Transform } = {};

	getTransForm(key: string): Transform {
		let transform: Transform = this.layerMap[key];
		return transform != null ? transform : TransformMap.TRANSFORM_DEFAULT;
	}

	updateMap(history: DrawHistory): void {
		if (this.historyNumber === history.getNowHistoryNumber()) {
			return;
		}
		if (
			history.isAvailable(this.historyNumber)
			|| this.historyNumber > history.getNowHistoryNumber()) {
			this.parseMoment(history.getMoments(-1, history.getNowHistoryNumber()));
			this.historyNumber = history.getNowHistoryNumber();
			return;
		}
		this.parseMoment(history.getMoments(this.historyNumber, history.getNowHistoryNumber()));
		this.historyNumber = history.getNowHistoryNumber();
	}

	private  parseMoment(moments: DrawMoment[]): void {
		let i = 0 | 0;
		let j = 0 | 0;
		let moment: DrawMoment;
		let keys: string[];

		while (i < moments.length) {
			moment = moments[i];

			i = (i + 1) | 0;
			j = 0 | 0;
			keys = moment.getKeys();
			while (j < keys.length) {
				let layer = moment.getLayerMoment(keys[j]);
				if (layer !== null && layer.getTransform() != null) {
					this.layerMap[keys[j]] = layer.getTransform()!;
				}
				j = (j + 1) | 0;
			}
		}
	}
}

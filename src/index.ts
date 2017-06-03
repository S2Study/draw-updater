import {Updater} from "./Updator";
import {history} from "@s2study/draw-api";
import DrawHistory = history.DrawHistory;

export class UpdaterFactory {
	static createInstance(
		history: DrawHistory,
		editorLayerId?: string
	): Updater {
		return new Updater(history, editorLayerId);
	}
}
export default UpdaterFactory;


/**
 * トランザクション
 */
export interface DrawTransaction {

	/**
	 * トランザクションが有効かどうか
	 */
	isAlive(): boolean;

	/**
	 * 変更内容をキャンセルする。
	 */
	cancel( duration?: boolean | null ): void;

	/**
	 * 変更内容を確定する。
	 */
	commit( duration?: boolean | null ): void;

	/**
	 * 直前までの変更を履歴に反映する。
	 */
	flush(): void;

	/**
	 * savePointを設定する。
	 */
	setSavePoint(): void;

	/**
	 * savePointに戻す。
	 */
	restoreSavePoint(): void;
}

/**
 * 線描画トランザクション
 */
export interface IPathTransaction extends DrawTransaction {

	/**
	 * 現在の起点を移動する。何もしなければ最初は0,0
	 * @param x
	 * @param y
	 */
	moveTo(
		x: number,
		y: number
	): IPathTransaction;

	/**
	 * 円弧を描画する。
	 * @param x1
	 * @param y1
	 * @param x2
	 * @param y2
	 * @param radius
	 */
	arcTo(
		x1: number,
		y1: number,
		x2: number,
		y2: number,
		radius: number
	): IPathTransaction;

	/**
	 * 直線を描画する。
	 * @param x
	 * @param y
	 */
	lineTo(
		x: number,
		y: number
	): IPathTransaction;

	/**
	 * 2次ベジェ曲線を描画する。
	 * @param cpx
	 * @param cpy
	 * @param x
	 * @param y
	 */
	quadraticCurveTo (
		cpx: number,
		cpy: number,
		x: number,
		y: number
	): IPathTransaction;

	/**
	 * 3次ベジェ曲線を描画する。
	 * @param cpx1
	 * @param cpy1
	 * @param cpx2
	 * @param cpy2
	 * @param x
	 * @param y
	 */
	bezierCurveTo (
		cpx1: number,
		cpy1: number,
		cpx2: number,
		cpy2: number,
		x: number,
		y: number
	): IPathTransaction;
}

import {Updater} from "./Updator";
import {history} from "@s2study/draw-api";
import DrawHistory = history.DrawHistory;

export function createInstance(
	history: DrawHistory,
	editorLayerId?: string
): Updater {
	return new Updater(history, editorLayerId);
}
export default createInstance;

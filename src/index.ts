import * as drawchat from "@s2study/draw-api";

import DrawchatUpdater = drawchat.updater.DrawchatUpdater;
import DrawHistory = drawchat.history.DrawHistory;
import {Updater} from "./Updator";

export function createInstance(
	history: DrawHistory,
	editorLayerId?: string
): DrawchatUpdater {
	return new Updater(history, editorLayerId);
}
export default createInstance;

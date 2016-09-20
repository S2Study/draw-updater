import DrawchatUpdater = drawchat.updater.DrawchatUpdater;
import DrawHistory = drawchat.core.DrawHistory;
import {Updater} from "./Updator";

export function createInstance(
	history:DrawHistory,
	editorLayerId?:string
):DrawchatUpdater{
	return new Updater(history,editorLayerId);
}
export default createInstance;

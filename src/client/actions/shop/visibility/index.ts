import keys from "../../ActionTypeKeys";

export interface IOpenAction {
	readonly type: keys.OPEN;
}

export interface ICloseAction {
	readonly type: keys.CLOSE;
}

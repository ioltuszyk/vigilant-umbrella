import Roact, { JsxInstance } from "@rbxts/roact";

export function SafeScreenGui(props: JsxInstance<ScreenGui>) {
	return <screengui {...props} ResetOnSpawn={false} IgnoreGuiInset={true}></screengui>;
}

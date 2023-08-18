import Roact, { Binding, Element, JsxInstance } from "@rbxts/roact";

type WindowProps = JsxInstance<Frame> & {
	Size: UDim2 | Binding<UDim2>;
	Position: UDim2;
};

/**
 * A container that can be used to group elements together.
 */
export function Window(props: Roact.PropsWithChildren<WindowProps>): Element {
	// TODO: Add padding and margins and any other props common to all containers
	return <frame {...props} AnchorPoint={new Vector2(0.5, 0.5)}></frame>;
}

import Roact, { JsxInstance, PropsWithChildren } from "@rbxts/roact";
import { useEffect, useRef, useState } from "@rbxts/roact-hooked";
import Object from "@rbxts/object-utils";

type NavbarProps = JsxInstance<Frame> & {
	Orientation: Enum.FillDirection.Horizontal | Enum.FillDirection.Vertical;
	Padding: number; // the padding between the elements and outside of the frame itself as a percentage of the frame's shortest side
};

export function Navbar(props: PropsWithChildren<NavbarProps>) {
	const frameRef = useRef<Frame>();
	const [padding, setPadding] = useState(new Vector2(0, 0));

	useEffect(() => {
		const sizeChangedHandler = () => {
			const selfFrame = frameRef.getValue();
			if (selfFrame !== undefined) {
				const aspectRatio = selfFrame.Size.X.Scale / selfFrame.Size.Y.Scale;

				if (aspectRatio >= 1) {
					// longer than it is tall
					setPadding(new Vector2(props.Padding / aspectRatio, props.Padding));
				} else {
					// taller than it is long
					setPadding(new Vector2(props.Padding, props.Padding * aspectRatio));
				}
			}
		};

		const sizeChangedConnection = frameRef.getValue()?.GetPropertyChangedSignal("Size").Connect(sizeChangedHandler);
		sizeChangedHandler();

		return () => {
			sizeChangedConnection?.Disconnect();
		};
	}, [frameRef]);

	// exclude orientation and padding from the props passed to the frame without destructuring
	const frameProps: { [key: string | symbol]: unknown } = {};
	for (const [key, value] of Object.entries(props)) {
		if (key !== "Orientation" && key !== "Padding") {
			frameProps[key] = value;
		}
	}
	frameProps[Roact.Children] = undefined; // done because the destructuring of the props otherwise conflicts with the nested elements in the frame

	return (
		<frame {...frameProps} Ref={frameRef} BackgroundTransparency={1}>
			<uipadding
				PaddingLeft={new UDim(padding.X / 2, 0)}
				PaddingRight={new UDim(padding.X / 2, 0)}
				PaddingTop={new UDim(padding.Y / 2, 0)}
				PaddingBottom={new UDim(padding.Y / 2, 0)}
			></uipadding>
			<uilistlayout
				FillDirection={props.Orientation}
				SortOrder={Enum.SortOrder.LayoutOrder}
				VerticalAlignment={
					props.Orientation === Enum.FillDirection.Horizontal
						? Enum.VerticalAlignment.Center
						: Enum.VerticalAlignment.Top
				}
				HorizontalAlignment={
					props.Orientation === Enum.FillDirection.Vertical
						? Enum.HorizontalAlignment.Center
						: Enum.HorizontalAlignment.Left
				}
			></uilistlayout>

			{props[Roact.Children]}
		</frame>
	);
}

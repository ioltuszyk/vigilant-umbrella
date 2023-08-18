import Object from "@rbxts/object-utils";
import { Spring, useMotor } from "@rbxts/pretty-roact-hooks";
import Roact, { PropsWithChildren } from "@rbxts/roact";
import { useCallback, useEffect, useMemo, useRef, useState } from "@rbxts/roact-hooked";
import { UserInputService } from "@rbxts/services";

type ButtonProps = PropsWithChildren<Roact.JsxInstance<TextButton>> & {
	OnActivated?: () => void;
};

export function Button(props: ButtonProps) {
	const onActivated = useMemo(() => {
		if (props.OnActivated === undefined) {
			return undefined;
		}
		return props.OnActivated;
	}, [props.OnActivated]);

	const [pressed, setPressed] = useState(false);
	const [scale, setScaleGoal] = useMotor(0);

	useEffect(() => {
		const mouseReleasedHandler = () => {
			setPressed(false);
		};

		const mouseReleasedConnection = UserInputService.InputEnded.Connect((input) => {
			if (
				input.UserInputType === Enum.UserInputType.MouseButton1 ||
				input.UserInputType === Enum.UserInputType.Touch
			) {
				mouseReleasedHandler();
			}
		});

		return () => {
			mouseReleasedConnection.Disconnect();
		};
	});

	useEffect(() => {
		setScaleGoal(pressed ? new Spring(0.97, { dampingRatio: 0.6 }) : new Spring(1, { dampingRatio: 0.6 }));
	}, [pressed]);

	const buttonProps: { [key: string | symbol]: unknown } = {};
	for (const [key, value] of Object.entries(props)) {
		if (key !== "OnActivated") {
			buttonProps[key] = value;
		}
	}
	buttonProps[Roact.Children] = undefined; // done because the destructuring of the props otherwise conflicts with the nested elements in the frame

	return (
		<textbutton
			{...buttonProps}
			TextScaled={true}
			Event={{
				MouseEnter: () => {
					setScaleGoal(
						pressed ? new Spring(0.97, { dampingRatio: 0.6 }) : new Spring(1.03, { dampingRatio: 0.6 }),
					);
				},
				MouseLeave: () => {
					setScaleGoal(
						pressed ? new Spring(0.97, { dampingRatio: 0.6 }) : new Spring(1, { dampingRatio: 0.6 }),
					);
				},
				MouseButton1Down: () => {
					setPressed(true);
				},
				Activated: onActivated,
			}}
		>
			{props[Roact.Children]}
			<uiscale Scale={scale}></uiscale>
			<uiaspectratioconstraint AspectRatio={1}></uiaspectratioconstraint>
		</textbutton>
	);
}

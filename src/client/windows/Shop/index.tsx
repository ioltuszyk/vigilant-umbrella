import Roact, { Element } from "@rbxts/roact";
import { Window } from "../../components";
import { SafeScreenGui } from "client/components/SafeScreenGui";
import { Header } from "client/components/Header";
import { Linear, Spring, useMotor } from "@rbxts/pretty-roact-hooks";
import { ShopContext } from "./context";
import { useEffect, useState } from "@rbxts/roact-hooked";
import { Navbar } from "client/components/Navbar";
import { Button } from "client/components/Button";
import { useLocalizedText } from "client/hooks/useLocalizedText";

type ShopProps = {
	open: boolean;
};

export function Shop(props: ShopProps): Element {
	const [open, setOpen] = useState(false);
	const [scale, setScaleGoal] = useMotor(0);

	useEffect(() => {
		if (props.open !== undefined) {
			setOpen(props.open);
		}
	}, [props.open]);

	useEffect(() => {
		setScaleGoal(open ? new Spring(1, { dampingRatio: 0.6 }) : new Linear(0, { velocity: 8 }));
	}, [open]);

	const featuredText = useLocalizedText("featured");
	const passesText = useLocalizedText("passes");

	return (
		<SafeScreenGui>
			<ShopContext.Consumer
				render={(context) => {
					return (
						<Window
							Size={scale.map((value) => {
								return new UDim2(0 + 0.6 * value, 0, 0 + 0.6 * value, 0);
							})}
							Position={new UDim2(0.5, 0, 0.5, 0)}
						>
							<uiaspectratioconstraint AspectRatio={1}></uiaspectratioconstraint>
							<Button
								Size={new UDim2(0.1, 0, 0.1, 0)}
								AnchorPoint={new Vector2(0.5, 0.5)}
								Position={new UDim2(1, 0, 0, 0)}
								Text={"X"}
								OnActivated={context.close}
							></Button>
							<Header title="Shop"></Header>
							<Navbar
								Orientation={Enum.FillDirection.Vertical}
								Padding={0.1}
								Size={new UDim2(0.18, 0, 0.9, 0)}
								Position={new UDim2(1, 0, 0.1, 0)}
								AnchorPoint={new Vector2(0, 0)}
							>
								<Button Size={new UDim2(1, 0, 1, 0)} Text={featuredText}></Button>
								<Button Size={new UDim2(1, 0, 1, 0)} Text={passesText}></Button>
							</Navbar>
						</Window>
					);
				}}
			></ShopContext.Consumer>
		</SafeScreenGui>
	);
}

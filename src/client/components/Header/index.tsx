import Roact from "@rbxts/roact";

type HeaderProps = {
	title: string;
};

export function Header({ title }: HeaderProps) {
	return (
		<imagelabel
			Image={"rbxassetid://10753774603"}
			Size={new UDim2(0.483, 0, 0.151, 0)}
			AnchorPoint={new Vector2(0, 0.4)}
			Position={new UDim2(-0.159, 0, -0.004, 0)}
			BackgroundTransparency={1}
		>
			<textlabel
				Text={title}
				Font={Enum.Font.FredokaOne}
				TextColor3={new Color3(1, 1, 1)}
				TextScaled={true}
				AnchorPoint={new Vector2(0, 0.5)}
				Size={new UDim2(0.404, 0, 0.646, 0)}
				Position={new UDim2(0.1, 0, 0.5, 0)}
				BackgroundTransparency={1}
			>
				<uistroke Color={Color3.fromRGB(26, 116, 173)} Thickness={1.614} />
				<uitextsizeconstraint MaxTextSize={45} MinTextSize={1} />
			</textlabel>
			<uisizeconstraint MaxSize={new Vector2(math.huge, 100)} MinSize={new Vector2(0, 0)}></uisizeconstraint>
		</imagelabel>
	);
}

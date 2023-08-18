import Roact, { Element } from "@rbxts/roact";
import { withHookDetection } from "@rbxts/roact-hooked";
import { Players } from "@rbxts/services";
import { Main } from "./main";

import { openSignal } from "./sample"; // SEE: src\client\main\index.tsx

withHookDetection(Roact);

export function App(): Element {
	return <Main />;
}

const target = Players.LocalPlayer.WaitForChild("PlayerGui");
Roact.mount(<App />, target);

// eslint-disable-next-line no-constant-condition
while (true) {
	task.wait(2);
	openSignal.Fire();
}

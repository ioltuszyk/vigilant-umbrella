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

print("Waiting 2 seconds to open shop from a signal observed by the shop component itself");
task.wait(2);
openSignal.Fire();

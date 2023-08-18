import Roact from "@rbxts/roact";
import { withHookDetection } from "@rbxts/roact-hooked";
import { MutableLiveData, Observer } from "@rbxts/observer";
import { Shop } from "client/windows";

withHookDetection(Roact);

export = function (target: Instance) {
	const externalOpenState = new MutableLiveData(false);

	const tree = Roact.mount(<Shop open={false} />, target);

	const openStateObserver = new Observer<boolean>();
	openStateObserver.connect((value) => {
		Roact.update(tree, <Shop open={value!} />);
	});
	externalOpenState.observe(openStateObserver);

	externalOpenState.setValue(true);

	return function (target: Instance) {
		Roact.unmount(tree);
	};
};

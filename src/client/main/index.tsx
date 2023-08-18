import Roact, { Element } from "@rbxts/roact";
import { useMemo, useReducer } from "@rbxts/roact-hooked";
import ActionTypeKeys from "client/actions/ActionTypeKeys";
import { ShopReducer, ShopStateType } from "client/reducers/ShopReducer";
import { Shop } from "client/windows";
import { ShopContext } from "client/windows/Shop/context";
import { openSignal } from "client/sample";

export function Main(): Element {
	const [state, dispatch] = useReducer(ShopReducer, {
		isOpen: false,
	});

	openSignal.Connect(() => {
		dispatch({ type: ActionTypeKeys.OPEN });
	});

	// NOTE: these could be actions being dispatched to a store
	// also, the story does not render the entire 'App' but rather just the shop 'Window' component, so this context does not exist in the story
	// this could easily be alleviated by creating a component that wraps the 'Shop' component, and then the story could render that component instead
	// though other alternatives could be used as well
	const storeContext = useMemo(
		() => ({
			close: () => dispatch({ type: ActionTypeKeys.CLOSE }),
		}),
		[],
	); // note that useMemo is used to prevent the shop from being rerendered every update, as the anonymous function here would otherwise trigger such a rerender

	return (
		<ShopContext.Provider value={storeContext}>
			<Shop open={state.isOpen}></Shop>
		</ShopContext.Provider>
	);
}

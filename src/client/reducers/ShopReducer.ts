import ActionTypeKeys from "client/actions/ActionTypeKeys";
import ActionTypes from "../actions/ActionTypes";

export type ShopStateType = {
	isOpen: boolean;
};

export function ShopReducer(prevState: ShopStateType, action: ActionTypes) {
	switch (action.type) {
		case ActionTypeKeys.OPEN:
			return { ...prevState, isOpen: true };
		case ActionTypeKeys.CLOSE:
			return { ...prevState, isOpen: false };
	}
}

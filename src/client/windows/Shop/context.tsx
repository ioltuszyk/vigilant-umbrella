import { createContext } from "@rbxts/roact";

export type ShopContextState = {
	close: () => void;
};

export const ShopContext = createContext<ShopContextState>({} as ShopContextState);

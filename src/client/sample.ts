import Signal from "@rbxts/signal";

// Fires a global signal that the shop will listen to and dispatch an action interally as a result.
// NOTE: this could alternatively be done through dispatching to a redux store with more visiblity rather than having the shop observe a global signal.
export const openSignal = new Signal();

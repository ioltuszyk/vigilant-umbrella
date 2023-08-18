import Roact from "@rbxts/roact";
import { useState } from "@rbxts/roact-hooked";
import { LocalizationService, Players } from "@rbxts/services";

const mappings: Map<string, [Roact.Binding<string>, Roact.BindingFunction<string>]> = new Map();

const translator = LocalizationService.GetTranslatorForPlayer(Players.LocalPlayer);
translator.GetPropertyChangedSignal("LocaleId").Connect(() => {
	for (const [key, [_, bindingUpdate]] of mappings) {
		bindingUpdate(translator.FormatByKey(key, []));
	}
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useLocalizedText(key: string, formatValues?: [any]): Roact.Binding<string> {
	//TODO: treat formatValues as a dependency

	const [[binding, bindingUpdate], setBinding] = useState(() => {
		if (mappings.has(key)) {
			return mappings.get(key) as [Roact.Binding<string>, Roact.BindingFunction<string>];
		}
		const [success, translatedText] = pcall(() => translator.FormatByKey(key, formatValues));
		const [_binding, _bindingUpdate] = Roact.createBinding<string>(
			success ? (translatedText as string) : `$${key}`,
		);

		if (!success) {
			warn(`Failed to translate key ${key}`);
		}

		mappings.set(key, [_binding, _bindingUpdate]);
		return [_binding, _bindingUpdate];
	});
	return binding;
}

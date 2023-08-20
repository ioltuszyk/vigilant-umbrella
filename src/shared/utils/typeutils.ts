import { t } from "@rbxts/t";

export type CheckedType<T> = T extends t.check<infer U> ? U : never;

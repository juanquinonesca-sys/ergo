import { describe, expect, it } from "vitest";
import type { InputSchema } from "../bindings/InputSchema";
import { countMissingRequired } from "./fieldImportance";

const field = (overrides: Partial<InputSchema>): InputSchema => ({
    id: null,
    type: "string",
    label: null,
    description: null,
    default: null,
    importance: "optional",
    variants: null,
    properties: null,
    items: null,
    target: null,
    ...overrides,
});

const schemas: InputSchema[] = [
    field({ id: "title", importance: "required" }),
    field({ id: "subtitle" }),
    field({ id: "abstract", type: "content", importance: "required" }),
    field({
        id: "people",
        type: "array",
        importance: "required",
        items: field({
            type: "object",
            properties: [field({ id: "name", importance: "required" }), field({ id: "note" })],
        }),
    }),
];

describe("countMissingRequired", () => {
    it.each([
        ["everything empty", {}, 3],
        [
            "filled values, blank rich text, one unnamed entry",
            {
                title: "T",
                abstract: [{ text: "  " }],
                people: [{ name: "Ana" }, { name: "" }],
            },
            2,
        ],
        [
            "all required filled",
            { title: "T", abstract: [{ text: "Hi" }], people: [{ name: "Ana" }] },
            0,
        ],
    ])("%s", (_case, values, expected) => {
        expect(countMissingRequired(schemas, values)).toBe(expected);
    });
});

import { describe, expect, it, vi } from "vitest";
import { EditorState, TextSelection } from "prosemirror-state";
import { bodySchema } from "./prosemirror/schema";
import { richTextToInlineNodes } from "./prosemirror/astBridge";
import { createRichText } from "../state/ast/defaults";
import { tryApplyHeadingLevelToCurrentBlock } from "./headingToggle";
import * as activeView from "./prosemirror/activeView";

describe("tryApplyHeadingLevelToCurrentBlock", () => {
    it("converts a top-level paragraph to a heading", () => {
        const paragraph = bodySchema.nodes.paragraph.create(
            { elementId: "p1" },
            richTextToInlineNodes(bodySchema, [createRichText("Body")]),
        );
        const doc = bodySchema.nodes.doc.create(null, [paragraph]);
        const view = {
            state: EditorState.create({
                schema: bodySchema,
                doc,
                selection: TextSelection.create(doc, 2),
            }),
        };
        vi.spyOn(activeView, "getActiveBodyView").mockReturnValue(
            view as never,
        );

        const actions: unknown[] = [];
        expect(
            tryApplyHeadingLevelToCurrentBlock(3, (action) => {
                actions.push(action);
            }),
        ).toBe(true);
        expect(actions).toEqual([
            {
                type: "CONVERT_ELEMENT",
                payload: {
                    elementId: "p1",
                    targetKind: "Heading",
                    headingLevel: 3,
                },
            },
        ]);
    });

    it("demotes a heading when the same level shortcut is pressed", () => {
        const heading = bodySchema.nodes.heading.create(
            { elementId: "h1", level: 2 },
            richTextToInlineNodes(bodySchema, [createRichText("Title")]),
        );
        const doc = bodySchema.nodes.doc.create(null, [heading]);
        const view = {
            state: EditorState.create({
                schema: bodySchema,
                doc,
                selection: TextSelection.create(doc, 2),
            }),
        };
        vi.spyOn(activeView, "getActiveBodyView").mockReturnValue(
            view as never,
        );

        const actions: unknown[] = [];
        expect(tryApplyHeadingLevelToCurrentBlock(2, (a) => actions.push(a))).toBe(
            true,
        );
        expect(actions).toEqual([
            {
                type: "CONVERT_ELEMENT",
                payload: {
                    elementId: "h1",
                    targetKind: "Paragraph",
                },
            },
        ]);
    });

    it("updates heading level when a different level shortcut is pressed", () => {
        const heading = bodySchema.nodes.heading.create(
            { elementId: "h1", level: 2 },
            richTextToInlineNodes(bodySchema, [createRichText("Title")]),
        );
        const doc = bodySchema.nodes.doc.create(null, [heading]);
        const view = {
            state: EditorState.create({
                schema: bodySchema,
                doc,
                selection: TextSelection.create(doc, 2),
            }),
        };
        vi.spyOn(activeView, "getActiveBodyView").mockReturnValue(
            view as never,
        );

        const actions: unknown[] = [];
        expect(tryApplyHeadingLevelToCurrentBlock(4, (a) => actions.push(a))).toBe(
            true,
        );
        expect(actions).toEqual([
            {
                type: "UPDATE_HEADING",
                payload: {
                    headingId: "h1",
                    level: 4,
                },
            },
        ]);
    });

    it("splits a partial paragraph selection out into its own heading", () => {
        const paragraph = bodySchema.nodes.paragraph.create(
            { elementId: "p1" },
            richTextToInlineNodes(bodySchema, [createRichText("Intro method rest")]),
        );
        const doc = bodySchema.nodes.doc.create(null, [paragraph]);
        // Select "method" (paragraph content starts at position 1).
        const view = {
            state: EditorState.create({
                schema: bodySchema,
                doc,
                selection: TextSelection.create(doc, 7, 13),
            }),
            dispatch(tr: import("prosemirror-state").Transaction) {
                view.state = view.state.apply(tr);
            },
        };
        vi.spyOn(activeView, "getActiveBodyView").mockReturnValue(
            view as never,
        );

        const actions: unknown[] = [];
        expect(tryApplyHeadingLevelToCurrentBlock(1, (a) => actions.push(a))).toBe(
            true,
        );
        const texts: string[] = [];
        view.state.doc.forEach((block) => texts.push(block.textContent));
        expect(texts).toEqual(["Intro ", "method", " rest"]);
        expect(view.state.selection.$from.parent.textContent).toBe("method");
        expect(actions).toHaveLength(1);
        expect(actions[0]).toMatchObject({
            type: "CONVERT_ELEMENT",
            payload: { targetKind: "Heading", headingLevel: 1 },
        });
    });
});

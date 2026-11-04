import { describe, expect, it } from "vitest";
import { EditorState, TextSelection } from "prosemirror-state";
import { bodySchema } from "./schema";
import { readActiveTextMarks } from "./textMarkState";

describe("readActiveTextMarks", () => {
    const doc = bodySchema.nodes.doc.create(null, [
        bodySchema.nodes.paragraph.create(
            { elementId: "p1" },
            [
                bodySchema.text("plain"),
                bodySchema.text("bold", [bodySchema.marks.strong.create()]),
            ],
        ),
    ]);

    it("detects stored marks at an empty selection", () => {
        const state = EditorState.create({
            doc,
            selection: TextSelection.create(doc, 2),
        });
        const marked = state.apply(
            state.tr.addStoredMark(bodySchema.marks.em.create()),
        );
        expect(readActiveTextMarks(marked)).toEqual({
            bold: false,
            italic: true,
            underline: false,
            inListItem: false,
        });
    });

    it("detects marks under the caret and across a range", () => {
        const inBold = EditorState.create({
            doc,
            selection: TextSelection.create(doc, 7),
        });
        expect(readActiveTextMarks(inBold).bold).toBe(true);

        const plainOnly = EditorState.create({
            doc,
            selection: TextSelection.create(doc, 1, 6),
        });
        expect(readActiveTextMarks(plainOnly)).toEqual({
            bold: false,
            italic: false,
            underline: false,
            inListItem: false,
        });
    });

    it("reports a caret inside a nested list item", () => {
        const item = (text: string, nested?: ReturnType<typeof bodySchema.nodes.list.create>) =>
            bodySchema.nodes.list_item.create(null, [
                bodySchema.nodes.paragraph.create({ elementId: "" }, [bodySchema.text(text)]),
                ...(nested ? [nested] : []),
            ]);
        const nested = bodySchema.nodes.list.create({ elementId: "", ordered: false }, [item("child")]);
        const listDoc = bodySchema.nodes.doc.create(null, [
            bodySchema.nodes.list.create({ elementId: "l1", ordered: false }, [item("parent", nested)]),
            bodySchema.nodes.paragraph.create({ elementId: "p1" }, [bodySchema.text("after")]),
        ]);
        let childPos = -1;
        let afterPos = -1;
        listDoc.descendants((node, pos) => {
            if (node.isText && node.text === "child") childPos = pos + 1;
            if (node.isText && node.text === "after") afterPos = pos + 1;
        });
        const at = (pos: number) =>
            readActiveTextMarks(
                EditorState.create({ doc: listDoc, selection: TextSelection.create(listDoc, pos) }),
            ).inListItem;
        expect(at(childPos)).toBe(true);
        expect(at(afterPos)).toBe(false);
    });
});

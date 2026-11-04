import { Plugin } from "prosemirror-state";
import type { Node as PMNode } from "prosemirror-model";
import { Decoration, DecorationSet } from "prosemirror-view";
import { m } from "../../paraglide/messages.js";

export const EMPTY_DOC_CLASS = "ergo-empty-doc";

const isEmptyDoc = (doc: PMNode) =>
    doc.childCount === 1 &&
    doc.firstChild!.type.name === "paragraph" &&
    doc.firstChild!.content.size === 0;

/**
 * Hint text on the lone empty paragraph of an empty body. It is a decoration
 * (CSS `::before` reading `data-placeholder`), never document content, so it
 * does not reach the AST or the preview.
 */
export const emptyDocPlaceholderPlugin = () =>
    new Plugin({
        props: {
            decorations: (state) =>
                isEmptyDoc(state.doc)
                    ? DecorationSet.create(state.doc, [
                          Decoration.node(0, state.doc.firstChild!.nodeSize, {
                              class: EMPTY_DOC_CLASS,
                              "data-placeholder": m.editor_empty_body_hint(),
                          }),
                      ])
                    : null,
        },
    });

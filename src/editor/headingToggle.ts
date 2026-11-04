import { TextSelection } from "prosemirror-state";
import type { EditorView } from "prosemirror-view";
import type { ASTAction } from "../state/ast/actions";
import { clampHeadingLevel } from "./headingLevels";
import { getActiveBodyView } from "./prosemirror/activeView";
import { topLevelTextBlockAtSelection } from "./prosemirror/topLevelTextBlock";

/**
 * When part of a top-level paragraph is selected, split the paragraph around
 * the selection (as two Enter presses would) and leave the caret in the middle
 * piece, so only the selected text becomes the heading.
 */
const isolateSelectedParagraphText = (view: EditorView) => {
    const { from, to, empty, $from, $to } = view.state.selection;
    if (
        empty ||
        $from.depth !== 1 ||
        !$from.sameParent($to) ||
        $from.parent.type.name !== "paragraph"
    ) {
        return;
    }
    const tr = view.state.tr;
    if (to < $to.end()) tr.split(to);
    const splitBefore = from > $from.start();
    if (splitBefore) tr.split(from);
    if (!tr.docChanged) return;
    tr.setSelection(TextSelection.create(tr.doc, splitBefore ? from + 2 : from));
    view.dispatch(tr);
};

/**
 * Apply a heading-level shortcut to the block under the caret:
 * - top-level paragraph → heading at `level`
 * - heading at the same level → paragraph
 * - heading at a different level → update level
 *
 * A partial selection inside a paragraph is first split out into its own block.
 *
 * Returns false when the caret is not in a convertible top-level block.
 */
export const tryApplyHeadingLevelToCurrentBlock = (
    level: number,
    dispatch: (action: ASTAction) => void,
): boolean => {
    const view = getActiveBodyView();
    if (!view) {
        return false;
    }

    isolateSelectedParagraphText(view);
    const block = topLevelTextBlockAtSelection(view.state);
    if (!block) {
        return false;
    }

    const clampedLevel = clampHeadingLevel(level);

    if (block.kind === "paragraph") {
        dispatch({
            type: "CONVERT_ELEMENT",
            payload: {
                elementId: block.elementId,
                targetKind: "Heading",
                headingLevel: clampedLevel,
            },
        });
        return true;
    }

    if (block.level === clampedLevel) {
        dispatch({
            type: "CONVERT_ELEMENT",
            payload: {
                elementId: block.elementId,
                targetKind: "Paragraph",
            },
        });
        return true;
    }

    dispatch({
        type: "UPDATE_HEADING",
        payload: {
            headingId: block.elementId,
            level: clampedLevel,
        },
    });
    return true;
};

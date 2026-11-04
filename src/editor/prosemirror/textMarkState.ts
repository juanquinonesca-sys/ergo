import type { EditorState } from "prosemirror-state";
import type { MarkType } from "prosemirror-model";

export interface ActiveTextMarks {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    /** Caret inside a list item: the toolbar offers list level controls. */
    inListItem: boolean;
}

export const INACTIVE_TEXT_MARKS: ActiveTextMarks = {
    bold: false,
    italic: false,
    underline: false,
    inListItem: false,
};

const marksEqual = (left: ActiveTextMarks, right: ActiveTextMarks): boolean =>
    left.bold === right.bold &&
    left.italic === right.italic &&
    left.underline === right.underline &&
    left.inListItem === right.inListItem;

const selectionInListItem = (state: EditorState): boolean => {
    const { $from } = state.selection;
    for (let depth = $from.depth; depth > 0; depth -= 1) {
        if ($from.node(depth).type.name === "list_item") return true;
    }
    return false;
};

const markIsActive = (state: EditorState, markType: MarkType): boolean => {
    const { from, to, empty } = state.selection;
    if (empty) {
        const marks = state.storedMarks ?? state.selection.$from.marks();
        return !!markType.isInSet(marks);
    }
    return state.doc.rangeHasMark(from, to, markType);
};

export const readActiveTextMarks = (state: EditorState): ActiveTextMarks => ({
    bold: markIsActive(state, state.schema.marks.strong),
    italic: markIsActive(state, state.schema.marks.em),
    underline: markIsActive(state, state.schema.marks.underline),
    inListItem: selectionInListItem(state),
});

let snapshot: ActiveTextMarks = INACTIVE_TEXT_MARKS;
const listeners = new Set<() => void>();

const notify = (): void => {
    for (const listener of listeners) {
        listener();
    }
};

export const publishActiveTextMarks = (state: EditorState | null): void => {
    const next = state ? readActiveTextMarks(state) : INACTIVE_TEXT_MARKS;
    if (marksEqual(snapshot, next)) {
        return;
    }
    snapshot = next;
    notify();
};

export const subscribeActiveTextMarks = (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

export const getActiveTextMarksSnapshot = (): ActiveTextMarks => snapshot;

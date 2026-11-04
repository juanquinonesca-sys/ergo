import { TextSelection } from "prosemirror-state";
import { getActiveBodyView } from "./activeView";
import { indentListItem, liftListItem } from "./listIndent";

/**
 * Right-click in the body acts where the user clicked (as in word processors):
 * move the caret to the click point unless it falls inside the current
 * non-empty selection, which the menu should keep (e.g. "convert to heading").
 */
export const placeBodyCaretAtContextMenu = (clientX: number, clientY: number): void => {
    const view = getActiveBodyView();
    if (!view) return;
    const hit = view.posAtCoords({ left: clientX, top: clientY });
    if (!hit) return;
    const { from, to, empty } = view.state.selection;
    if (!empty && hit.pos >= from && hit.pos <= to) return;
    const selection = TextSelection.near(view.state.doc.resolve(hit.pos));
    view.dispatch(view.state.tr.setSelection(selection));
    view.focus();
};

/** Whether the list commands apply at the caret (the menu disables them otherwise). */
export const canIndentListItemAtCaret = (): boolean => {
    const view = getActiveBodyView();
    return view ? indentListItem(view.state) : false;
};

export const canOutdentListItemAtCaret = (): boolean => {
    const view = getActiveBodyView();
    return view ? liftListItem(view.state) : false;
};

import { TextSelection } from "prosemirror-state";
import type { EditorView } from "prosemirror-view";
import type { ActionInvocation } from "../../bindings/ActionInvocation";

/** MIME type the sidebar element palette uses to carry an `ActionInvocation`. */
export const PALETTE_DRAG_MIME = "application/x-ergo-action";

const carriesPaletteItem = (event: DragEvent) =>
    event.dataTransfer?.types.includes(PALETTE_DRAG_MIME) ?? false;

/**
 * Body editor DOM handlers for palette drops: move the caret to the drop point,
 * then run the same `ActionInvocation` a toolbar click or shortcut would.
 */
export const paletteDropHandlers = (
    onDrop: (invocation: ActionInvocation) => void,
) => ({
    dragover: (_view: EditorView, event: DragEvent) => {
        if (!carriesPaletteItem(event)) return false;
        event.preventDefault();
        event.dataTransfer!.dropEffect = "copy";
        return false; // let dropCursor paint the indicator
    },
    drop: (view: EditorView, event: DragEvent) => {
        if (!carriesPaletteItem(event)) return false;
        event.preventDefault();
        const hit = view.posAtCoords({ left: event.clientX, top: event.clientY });
        if (hit) {
            const $pos = view.state.doc.resolve(hit.pos);
            view.dispatch(view.state.tr.setSelection(TextSelection.near($pos)));
        }
        view.focus();
        onDrop(JSON.parse(event.dataTransfer!.getData(PALETTE_DRAG_MIME)));
        return true;
    },
});

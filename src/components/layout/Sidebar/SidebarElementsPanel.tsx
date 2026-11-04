import type { DragEvent } from "react";
import { useActionDispatcher } from "../../../actions/runtime";
import { PALETTE_DRAG_MIME } from "../../../editor/prosemirror/paletteDrop";
import { NavItemButton } from "../../atoms/NavItemButton/NavItemButton";
import { INSERTABLE_ELEMENTS } from "../../organisms/EditorToolbar/insertableElements";
import { m } from "../../../paraglide/messages.js";
import styles from "./SidebarElementsPanel.module.css";

/** Insertable elements: drag one into the body, or click to insert at the caret. */
export const SidebarElementsPanel = () => {
    const dispatchAction = useActionDispatcher();
    return (
        <div className={styles.panel}>
            <p className={styles.hint}>{m.sidebar_elements_hint()}</p>
            {INSERTABLE_ELEMENTS.map(({ invocation, icon, label }) => (
                <NavItemButton
                    key={invocation.id}
                    variant="outline"
                    className={styles.item}
                    draggable
                    onDragStart={(event: DragEvent) => {
                        event.dataTransfer.setData(PALETTE_DRAG_MIME, JSON.stringify(invocation));
                        event.dataTransfer.effectAllowed = "copy";
                    }}
                    onClick={() => void dispatchAction(invocation)}
                >
                    <span className={styles.icon} aria-hidden>{icon}</span>
                    <span>{label()}</span>
                </NavItemButton>
            ))}
        </div>
    );
};

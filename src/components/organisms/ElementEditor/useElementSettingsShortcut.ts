import { useEffect, useRef, useState } from "react";
import { registerActiveElementSettingsToggle } from "../../../editor/elementSettingsBridge";
import { useBlockUiState } from "../../../editor/prosemirror/blockUiState";

/**
 * Controlled open-state for a block element's settings modal. Ctrl/Cmd+, is
 * handled by the action runtime (`editor::OpenElementSettings`) via
 * {@link registerActiveElementSettingsToggle} while the block is selected or in
 * fine-grained edit mode.
 */
export const useElementSettingsShortcut = (elementId: string) => {
    const { selected, editing } = useBlockUiState(elementId);
    const [open, setOpen] = useState(false);
    const hadBlockFocusRef = useRef(false);

    useEffect(() => {
        const focused = selected || editing;
        if (hadBlockFocusRef.current && !focused) {
            setOpen(false);
        }
        hadBlockFocusRef.current = focused;
    }, [selected, editing]);

    // Also while whole-selected, so the right-click menu (which selects the
    // block) can open its settings without entering edit mode.
    useEffect(() => {
        if (!editing && !selected) {
            return undefined;
        }

        return registerActiveElementSettingsToggle(() => {
            setOpen((value) => !value);
        });
    }, [editing, selected]);

    return { open, setOpen };
};

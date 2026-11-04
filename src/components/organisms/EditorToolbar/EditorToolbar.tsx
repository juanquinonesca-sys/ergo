import { memo, useCallback, useState, type MouseEvent } from "react";
import {
    Add24Regular,
    ChevronDown16Regular,
    Delete24Regular,
    TextBold24Regular,
    TextHeader124Regular,
    TextBulletListAdd24Regular,
    TextIndentDecreaseLtr24Regular,
    TextIndentIncreaseLtr24Regular,
    TextItalic24Regular,
    TextUnderline24Regular,
} from "@fluentui/react-icons";
import type { ActionId } from "../../../bindings/ActionId";
import type { ActionInvocation } from "../../../bindings/ActionInvocation";
import { IconButton } from "../../atoms/IconButton/IconButton";
import { MenuItemButton } from "../../atoms/MenuItemButton/MenuItemButton";
import { ToolbarTextButton } from "../../atoms/ToolbarTextButton/ToolbarTextButton";
import { DropdownMenu } from "../../molecules/DropdownMenu/DropdownMenu";
import { SplitButton } from "../../molecules/SplitButton/SplitButton";
import { Toolbar, ToolbarGroup } from "../../molecules/Toolbar/Toolbar";
import { clampHeadingLevel, headingLevelOptions } from "../../../editor/headingLevels";
import {
    INACTIVE_TEXT_MARKS,
    type ActiveTextMarks,
} from "../../../editor/prosemirror/textMarkState";
import { TABLE_CELL_FORBIDDEN_ACTION_IDS } from "../../../editor/prosemirror/table/tableCellInsertPolicy";
import { useKeymap } from "../../../settings/SettingsProvider";
import { lookupActionShortcut } from "../../../settings/keymap/profile";
import { m } from "../../../paraglide/messages.js";
import { INSERTABLE_ELEMENTS } from "./insertableElements";
import styles from "./EditorToolbar.module.css";

/** Keep ProseMirror selection when toolbar buttons are clicked. */
const keepEditorSelection = (event: MouseEvent) => {
    event.preventDefault();
};

/** Headings have their own split button; the Insert menu lists the rest. */
const INSERT_MENU_ITEMS = INSERTABLE_ELEMENTS.filter(
    (item) => item.invocation.id !== "editor::InsertHeading",
);

export interface EditorToolbarProps {
    canDeleteFocusedTarget: boolean;
    activeTextMarks?: ActiveTextMarks;
    /** When true, only in-cell block inserts (no heading/table/figure/diagram). */
    tableCellEditing?: boolean;
    onDelete: () => void;
    onBold: () => void;
    onItalic: () => void;
    onUnderline: () => void;
    onInsertHeading: (level: number) => void;
    onInsert: (invocation: ActionInvocation) => void;
    onAddListSubItem: () => void;
    onIndentListItem: () => void;
    onOutdentListItem: () => void;
}

export const EditorToolbar = memo(
    ({
        canDeleteFocusedTarget,
        activeTextMarks = INACTIVE_TEXT_MARKS,
        tableCellEditing = false,
        onDelete,
        onBold,
        onItalic,
        onUnderline,
        onInsertHeading,
        onInsert,
        onAddListSubItem,
        onIndentListItem,
        onOutdentListItem,
    }: EditorToolbarProps) => {
        const [headingLevel, setHeadingLevel] = useState(1);
        const [insertOpen, setInsertOpen] = useState(false);
        const { keymap } = useKeymap();

        /** "Negrita · Ctrl+B" when the action has a binding, else just the label. */
        const withShortcut = (label: string, actionId: ActionId) => {
            const shortcut = lookupActionShortcut(keymap, actionId);
            return shortcut ? `${label} · ${shortcut}` : label;
        };

        const insertAtHeadingLevel = useCallback(
            (nextLevel: number) => {
                const clamped = clampHeadingLevel(nextLevel);
                setHeadingLevel(clamped);
                onInsertHeading(clamped);
            },
            [onInsertHeading],
        );

        return (
            <Toolbar scrollable>
            <ToolbarGroup>
                <IconButton
                    title={withShortcut(m.element_delete(), "editor::DeleteElement")}
                    aria-label={m.element_delete()}
                    disabled={!canDeleteFocusedTarget}
                    onClick={onDelete}
                >
                    <Delete24Regular />
                </IconButton>
            </ToolbarGroup>
            <ToolbarGroup>
                <IconButton
                    title={withShortcut(m.menubar_text_bold(), "editor::Bold")}
                    aria-label={m.menubar_text_bold()}
                    pressed={activeTextMarks.bold}
                    onMouseDown={keepEditorSelection}
                    onClick={onBold}
                >
                    <TextBold24Regular />
                </IconButton>
                <IconButton
                    title={withShortcut(m.menubar_text_italic(), "editor::Italic")}
                    aria-label={m.menubar_text_italic()}
                    pressed={activeTextMarks.italic}
                    onMouseDown={keepEditorSelection}
                    onClick={onItalic}
                >
                    <TextItalic24Regular />
                </IconButton>
                <IconButton
                    title={withShortcut(m.menubar_text_underline(), "editor::Underline")}
                    aria-label={m.menubar_text_underline()}
                    pressed={activeTextMarks.underline}
                    onMouseDown={keepEditorSelection}
                    onClick={onUnderline}
                >
                    <TextUnderline24Regular />
                </IconButton>
            </ToolbarGroup>
            <ToolbarGroup>
                <SplitButton
                    disabled={tableCellEditing}
                    icon={<TextHeader124Regular />}
                    primaryLabel={m.menubar_insert_heading()}
                    menuLabel={m.editor_heading_level()}
                    options={headingLevelOptions()}
                    selectedValue={String(headingLevel)}
                    onPrimaryClick={() => insertAtHeadingLevel(headingLevel)}
                    onOptionSelect={(value) =>
                        insertAtHeadingLevel(Number(value))
                    }
                />
            </ToolbarGroup>
            {activeTextMarks.inListItem && (
                <ToolbarGroup>
                    <IconButton
                        title={m.action_editor_add_list_sub_item()}
                        aria-label={m.action_editor_add_list_sub_item()}
                        onMouseDown={keepEditorSelection}
                        onClick={onAddListSubItem}
                    >
                        <TextBulletListAdd24Regular />
                    </IconButton>
                    <IconButton
                        // Tab / Shift+Tab are handled by the body editor itself.
                        title={`${m.action_editor_outdent_list_item()} · Shift+Tab`}
                        aria-label={m.action_editor_outdent_list_item()}
                        onMouseDown={keepEditorSelection}
                        onClick={onOutdentListItem}
                    >
                        <TextIndentDecreaseLtr24Regular />
                    </IconButton>
                    <IconButton
                        title={`${m.action_editor_indent_list_item()} · Tab`}
                        aria-label={m.action_editor_indent_list_item()}
                        onMouseDown={keepEditorSelection}
                        onClick={onIndentListItem}
                    >
                        <TextIndentIncreaseLtr24Regular />
                    </IconButton>
                </ToolbarGroup>
            )}
            <ToolbarGroup>
                <DropdownMenu
                    align="start"
                    menuLabel={m.editor_insert_menu()}
                    open={insertOpen}
                    onOpenChange={setInsertOpen}
                    trigger={
                        <ToolbarTextButton
                            className={styles.insertTrigger}
                            onMouseDown={keepEditorSelection}
                        >
                            <Add24Regular aria-hidden />
                            {m.editor_insert_menu()}
                            <ChevronDown16Regular aria-hidden />
                        </ToolbarTextButton>
                    }
                >
                    {INSERT_MENU_ITEMS.map(({ invocation, icon, label }) => {
                        const shortcut = lookupActionShortcut(keymap, invocation.id);
                        return (
                            <MenuItemButton
                                key={invocation.id}
                                role="menuitem"
                                variant="dropdown"
                                disabled={
                                    tableCellEditing &&
                                    TABLE_CELL_FORBIDDEN_ACTION_IDS.includes(invocation.id)
                                }
                                onMouseDown={keepEditorSelection}
                                onClick={() => {
                                    setInsertOpen(false);
                                    onInsert(invocation);
                                }}
                            >
                                <span className={styles.menuItemRow}>
                                    <span className={styles.menuItemIcon} aria-hidden>
                                        {icon}
                                    </span>
                                    <span className={styles.menuItemLabel}>{label()}</span>
                                    {shortcut && (
                                        <span className={styles.menuShortcut}>{shortcut}</span>
                                    )}
                                </span>
                            </MenuItemButton>
                        );
                    })}
                </DropdownMenu>
            </ToolbarGroup>
        </Toolbar>
        );
    },
);

EditorToolbar.displayName = "EditorToolbar";

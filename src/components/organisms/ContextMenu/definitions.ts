import type { ActionId } from "../../../bindings/ActionId";
import {
    canIndentListItemAtCaret,
    canOutdentListItemAtCaret,
} from "../../../editor/prosemirror/bodyContextMenuCaret";
import { isActiveTableCellEditing } from "../../../editor/prosemirror/table/tableCellInsertPolicy";
import type { TableCellTarget } from "../../../editor/prosemirror/table/tableFocusRegistry";
import { editContextMenuEntries } from "../../../menus/editMenu";
import { m } from "../../../paraglide/messages.js";

/** What was right-clicked; picks the menu. */
export type ContextMenuSurface =
    | "app"
    | "workspace"
    | "body"
    | "bodyList"
    | "table"
    | "block";

/** The right-click target, captured when the menu opens. */
export interface ContextMenuTarget {
    surface: ContextMenuSurface;
    /** Action context the click happened in; entries dispatch from it, not from
     *  the menu (which lives under `app` and would skip the editor handlers). */
    fromContextId: string | null;
    /** Table cell under the click, for row/column entries. */
    tableCell: TableCellTarget | null;
    /** Block element under the click (table, figure, equation, diagram). */
    elementId: string | null;
}

export type ContextMenuEntry =
    | { type: "separator" }
    | {
          type: "command";
          commandId: ActionId;
          /** Dispatched as `{ id, payload }` through the action runtime. */
          payload?: unknown;
          /** Overrides the command registry label. */
          label?: () => string;
          /** Shown disabled when this returns false. */
          isEnabled?: () => boolean;
      }
    | { type: "placeholder"; label: string }
    | { type: "inspect"; debugOnly: true };

const SEPARATOR: ContextMenuEntry = { type: "separator" };

const command = (
    commandId: ActionId,
    label?: () => string,
    extra: { payload?: unknown; isEnabled?: () => boolean } = {},
): ContextMenuEntry => ({ type: "command", commandId, label, payload: null, ...extra });

/**
 * Classify a right-click target. Order matters: a list inside a table cell is
 * still the table, and inline chips (no `data-pm-nodeview`) stay text.
 */
export const resolveContextMenuSurface = (
    hasActiveProject: boolean,
    target: EventTarget | null,
): ContextMenuSurface => {
    if (!hasActiveProject) return "app";
    if (!(target instanceof Element) || !target.closest("[data-ergo-body-editor]")) {
        return "workspace";
    }
    if (target.closest('[data-pm-nodeview="table_block"]')) return "table";
    if (target.closest("li")) return "bodyList";
    if (target.closest("[data-pm-nodeview]")) return "block";
    return "body";
};

const GENERAL: ContextMenuEntry[] = [
    ...editContextMenuEntries(),
    SEPARATOR,
    { type: "command", commandId: "view::OpenCommandPalette" },
    SEPARATOR,
    { type: "inspect", debugOnly: true },
];

const UNDO_REDO: ContextMenuEntry[] = [
    command("edit::Undo", m.menubar_undo),
    command("edit::Redo", m.menubar_redo),
];

const FORMATTING: ContextMenuEntry[] = [
    command("editor::Bold", m.menubar_text_bold),
    command("editor::Italic", m.menubar_text_italic),
    command("editor::Underline", m.menubar_text_underline),
];

const headingEntry = (level: number): ContextMenuEntry =>
    command("editor::InsertHeading", () => m.context_menu_convert_heading({ level }), {
        payload: { level },
    });

const TEXT: ContextMenuEntry[] = [
    ...FORMATTING,
    SEPARATOR,
    headingEntry(1),
    headingEntry(2),
    headingEntry(3),
    command("editor::ConvertToParagraph", m.context_menu_convert_paragraph),
];

const LIST: ContextMenuEntry[] = [
    command("editor::AddListSubItem", m.action_editor_add_list_sub_item),
    command("editor::IndentListItem", m.action_editor_indent_list_item, {
        isEnabled: canIndentListItemAtCaret,
    }),
    command("editor::OutdentListItem", m.action_editor_outdent_list_item, {
        isEnabled: canOutdentListItemAtCaret,
    }),
];

const elementEntries = (elementId: string | null): ContextMenuEntry[] => [
    command("editor::OpenElementSettings", m.action_editor_open_element_settings),
    ...(elementId
        ? [command("editor::DeleteElement", m.menubar_delete_element, { payload: { elementId } })]
        : []),
];

const tableEntries = (target: ContextMenuTarget): ContextMenuEntry[] => {
    const cell = target.tableCell;
    const cellEntries: ContextMenuEntry[] = cell
        ? [
              command("editor::AddTableRow", m.editor_table_add_row, { payload: cell }),
              command("editor::AddTableColumn", m.editor_table_add_column, { payload: cell }),
              SEPARATOR,
              command("editor::RemoveTableRow", m.editor_table_remove_row, { payload: cell }),
              command("editor::RemoveTableColumn", m.editor_table_remove_column, {
                  payload: cell,
              }),
              SEPARATOR,
          ]
        : [];
    return [
        ...cellEntries,
        command("editor::MergeTableCells", m.action_editor_merge_table_cells, {
            isEnabled: isActiveTableCellEditing,
        }),
        command("editor::SplitTableCell", m.action_editor_split_table_cell, {
            isEnabled: isActiveTableCellEditing,
        }),
        SEPARATOR,
        ...elementEntries(target.elementId),
        SEPARATOR,
        ...UNDO_REDO,
    ];
};

/** Menu entries for a right-click target. */
export const contextMenuEntries = (target: ContextMenuTarget): ContextMenuEntry[] => {
    switch (target.surface) {
        case "app":
            return [
                { type: "command", commandId: "view::OpenCommandPalette" },
                SEPARATOR,
                { type: "inspect", debugOnly: true },
            ];
        case "workspace":
            return GENERAL;
        case "body":
            return [...TEXT, SEPARATOR, ...GENERAL];
        case "bodyList":
            return [...LIST, SEPARATOR, ...FORMATTING, SEPARATOR, ...GENERAL];
        case "table":
            return tableEntries(target);
        case "block":
            return [...elementEntries(target.elementId), SEPARATOR, ...UNDO_REDO];
    }
};

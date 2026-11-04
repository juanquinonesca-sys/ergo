import type { ActionId } from "../../../bindings/ActionId";
import { editContextMenuEntries } from "../../../menus/editMenu";
import { m } from "../../../paraglide/messages.js";

export type ContextMenuSurface = "app" | "workspace" | "body";

export type ContextMenuEntry =
    | { type: "separator" }
    | {
          type: "command";
          commandId: ActionId;
          /** When set, the entry dispatches `{ id, payload }` through the action runtime. */
          payload?: unknown;
          /** Overrides the command registry label (e.g. payload-specific wording). */
          label?: () => string;
      }
    | { type: "placeholder"; label: string }
    | { type: "inspect"; debugOnly: true };

const WORKSPACE_MENU: ContextMenuEntry[] = [
    ...editContextMenuEntries(),
    { type: "separator" },
    { type: "command", commandId: "view::OpenCommandPalette" },
    { type: "separator" },
    { type: "inspect", debugOnly: true },
];

const headingEntry = (level: number): ContextMenuEntry => ({
    type: "command",
    commandId: "editor::InsertHeading",
    payload: { level },
    label: () => m.context_menu_convert_heading({ level }),
});

/** Right-click inside the document body: text formatting and block conversion. */
const BODY_MENU: ContextMenuEntry[] = [
    { type: "command", commandId: "editor::Bold" },
    { type: "command", commandId: "editor::Italic" },
    { type: "command", commandId: "editor::Underline" },
    { type: "separator" },
    headingEntry(1),
    headingEntry(2),
    headingEntry(3),
    {
        type: "command",
        commandId: "editor::ConvertToParagraph",
        payload: null,
        label: m.context_menu_convert_paragraph,
    },
    { type: "separator" },
    ...WORKSPACE_MENU,
];

export const CONTEXT_MENU_DEFINITIONS: Record<
    ContextMenuSurface,
    ContextMenuEntry[]
> = {
    app: [
        { type: "command", commandId: "view::OpenCommandPalette" },
        { type: "separator" },
        { type: "inspect", debugOnly: true },
    ],
    workspace: WORKSPACE_MENU,
    body: BODY_MENU,
};

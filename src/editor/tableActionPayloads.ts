/**
 * Shared parsers for table editor action payloads.
 *
 * Several actions (`editor::RemoveTableRow`, `editor::RemoveTableColumn`) are
 * dispatched from more than one focused context (the element editor and the
 * body editor shell). The payload shapes are declared in
 * `commands/actionPayloads.ts` (`PayloadOf<"editor::RemoveTableRow">`); these
 * helpers validate `unknown` at runtime and return the field value (or null).
 */
import type { ActionInvocation } from "../bindings/ActionInvocation";
import { numericPayloadField } from "../commands/actionPayloads";
import type { TableCellTarget } from "./prosemirror/table/tableFocusRegistry";

/** Read `{ rowIndex: number }` from an action payload, or null if absent/invalid. */
export const parseRemoveTableRowPayload = (
    payload: ActionInvocation["payload"],
): number | null => numericPayloadField(payload, "rowIndex");

/** Read `{ colIndex: number }` from an action payload, or null if absent/invalid. */
export const parseRemoveTableColumnPayload = (
    payload: ActionInvocation["payload"],
): number | null => numericPayloadField(payload, "colIndex");

/** Read `{ tableId, row, col }` (a cell picked from outside the table, e.g. a
 *  right-click), or null when the payload does not carry one. */
export const parseTableCellPayload = (
    payload: ActionInvocation["payload"],
): TableCellTarget | null => {
    const tableId =
        payload && typeof payload === "object" && "tableId" in payload
            ? (payload as { tableId: unknown }).tableId
            : null;
    const row = numericPayloadField(payload, "row");
    const col = numericPayloadField(payload, "col");
    return typeof tableId === "string" && row !== null && col !== null
        ? { tableId, row, col }
        : null;
};

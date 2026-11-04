import type { BodyFocusTarget } from "../selection";

export type TableFocusHandler = (target: BodyFocusTarget) => boolean;

const handlers = new Map<string, TableFocusHandler>();

export const registerTableFocusHandler = (
    elementId: string,
    handler: TableFocusHandler,
): void => {
    handlers.set(elementId, handler);
};

export const unregisterTableFocusHandler = (elementId: string): void => {
    handlers.delete(elementId);
};

export const applyTableCellFocus = (target: BodyFocusTarget): boolean => {
    const handler = handlers.get(target.elementId);
    return handler?.(target) ?? false;
};

/** A table cell addressed from outside the table's own editor (e.g. a right-click). */
export interface TableCellTarget {
    tableId: string;
    row: number;
    col: number;
}

type TableCellLocator = (clientX: number, clientY: number) => TableCellTarget | null;

// Keyed by the table node view's root element, so a DOM event target finds its
// table without a DOM-visible table id; entries die with their element.
const cellLocators = new WeakMap<Element, TableCellLocator>();

export const registerTableCellLocator = (dom: Element, locate: TableCellLocator): void => {
    cellLocators.set(dom, locate);
};

export const unregisterTableCellLocator = (dom: Element): void => {
    cellLocators.delete(dom);
};

/** The table cell under a point inside `target`'s table, or null. */
export const tableCellAtPoint = (
    target: Element,
    clientX: number,
    clientY: number,
): TableCellTarget | null => {
    const dom = target.closest('[data-pm-nodeview="table_block"]');
    return dom ? (cellLocators.get(dom)?.(clientX, clientY) ?? null) : null;
};

import { describe, expect, it } from "vitest";
import { resolveContextMenuSurface } from "./definitions";

/** Minimal body DOM: text, a list, a table (with a list in a cell) and a figure. */
const bodyFixture = () => {
    document.body.innerHTML = `
        <aside id="sidebar"><span id="outside">x</span></aside>
        <div data-ergo-body-editor>
            <div class="ProseMirror">
                <p><span id="text">text</span></p>
                <ul><li><p id="list-item">item</p></li></ul>
                <div data-pm-nodeview="table_block" data-element-id="t1">
                    <table><tbody><tr><td>
                        <p id="cell">cell</p>
                        <ul><li><p id="cell-list">nested</p></li></ul>
                    </td></tr></tbody></table>
                </div>
                <div data-pm-nodeview="figure" data-element-id="f1"><img id="figure" /></div>
            </div>
        </div>`;
    return (id: string) => document.getElementById(id);
};

describe("resolveContextMenuSurface", () => {
    it.each([
        ["text", "body"],
        ["list-item", "bodyList"],
        ["cell", "table"],
        ["cell-list", "table"],
        ["figure", "block"],
        ["outside", "workspace"],
    ])("classifies #%s as %s", (id, surface) => {
        const byId = bodyFixture();
        expect(resolveContextMenuSurface(true, byId(id))).toBe(surface);
    });

    it("uses the app menu without an open project", () => {
        const byId = bodyFixture();
        expect(resolveContextMenuSurface(false, byId("text"))).toBe("app");
    });
});

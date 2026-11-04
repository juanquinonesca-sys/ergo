import type { ReactNode } from "react";
import {
    Diagram24Regular,
    Image24Regular,
    Link24Regular,
    MathFormula24Regular,
    Table24Regular,
    TextBulletList24Regular,
    TextHeader124Regular,
    TextNumberListLtr24Regular,
    TextQuote24Regular,
} from "@fluentui/react-icons";
import type { ActionInvocation } from "../../../bindings/ActionInvocation";
import { SquareRoot24Regular } from "../../icons/SquareRoot24Regular";
import { TextParagraph24Regular } from "../../icons/TextParagraph24Regular";
import { m } from "../../../paraglide/messages.js";

export interface InsertableElement {
    invocation: ActionInvocation;
    icon: ReactNode;
    label: () => string;
}

/** Every body element a user can insert; shared by the toolbar menu and the sidebar palette. */
export const INSERTABLE_ELEMENTS: InsertableElement[] = [
    { invocation: { id: "editor::InsertParagraph", payload: null }, icon: <TextParagraph24Regular />, label: m.menubar_insert_paragraph },
    { invocation: { id: "editor::InsertHeading", payload: { level: 1 } }, icon: <TextHeader124Regular />, label: m.menubar_insert_heading },
    { invocation: { id: "editor::InsertQuote", payload: null }, icon: <TextQuote24Regular />, label: m.menubar_insert_quote },
    { invocation: { id: "editor::InsertList", payload: null }, icon: <TextBulletList24Regular />, label: m.menubar_insert_list },
    { invocation: { id: "editor::InsertEnumeration", payload: null }, icon: <TextNumberListLtr24Regular />, label: m.menubar_insert_enumeration },
    { invocation: { id: "editor::InsertTable", payload: null }, icon: <Table24Regular />, label: m.menubar_insert_table },
    { invocation: { id: "editor::InsertBlockEquation", payload: null }, icon: <MathFormula24Regular />, label: m.menubar_insert_block_equation },
    { invocation: { id: "editor::InsertInlineEquation", payload: null }, icon: <SquareRoot24Regular />, label: m.menubar_insert_inline_equation },
    { invocation: { id: "editor::InsertFigure", payload: null }, icon: <Image24Regular />, label: m.menubar_insert_figure },
    { invocation: { id: "editor::InsertDiagram", payload: null }, icon: <Diagram24Regular />, label: m.menubar_insert_diagram },
    { invocation: { id: "editor::InsertReference", payload: null }, icon: <Link24Regular />, label: m.menubar_insert_reference },
];

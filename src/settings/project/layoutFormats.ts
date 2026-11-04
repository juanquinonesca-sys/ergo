import type { PageMargins } from "../../bindings/PageMargins";
import type { ProjectSettings } from "../../bindings/ProjectSettings";

export type LayoutFields = Pick<
    ProjectSettings,
    | "page_margins"
    | "line_spacing"
    | "paragraph_spacing"
    | "first_line_indent_cm"
    | "font_size"
>;

const uniformMargins = (cm: number): PageMargins => ({
    top_cm: cm,
    bottom_cm: cm,
    left_cm: cm,
    right_cm: cm,
});

/**
 * Academic formats offered as one-click presets. Values follow each style's
 * published page setup (2.54 cm = 1 in, 1.27 cm = 0.5 in):
 * - APA 7 / MLA 9: 1 in margins, double spacing, no added space between
 *   paragraphs, 0.5 in first-line indent, 12 pt text.
 * - Vancouver (ICMJE): margins of at least 25 mm, double spacing throughout,
 *   12 pt text; paragraph spacing and indent are left to the template because
 *   the style does not fix them.
 */
export const LAYOUT_FORMATS: { id: string; label: string; layout: LayoutFields }[] = [
    {
        id: "apa7",
        label: "APA 7",
        layout: {
            page_margins: uniformMargins(2.54),
            line_spacing: "double",
            paragraph_spacing: "none",
            first_line_indent_cm: 1.27,
            font_size: 12,
        },
    },
    {
        id: "mla9",
        label: "MLA 9",
        layout: {
            page_margins: uniformMargins(2.54),
            line_spacing: "double",
            paragraph_spacing: "none",
            first_line_indent_cm: 1.27,
            font_size: 12,
        },
    },
    {
        id: "vancouver",
        label: "Vancouver",
        layout: {
            page_margins: uniformMargins(2.5),
            line_spacing: "double",
            font_size: 12,
        },
    },
];

/** Margins offered when switching margins from template default to custom. */
export const DEFAULT_CUSTOM_MARGINS = uniformMargins(2.54);

/** Layout fields cleared back to the template's values (font size stays). */
export const clearLayout = (settings: ProjectSettings): ProjectSettings => ({
    ...settings,
    page_margins: undefined,
    line_spacing: undefined,
    paragraph_spacing: undefined,
    first_line_indent_cm: undefined,
});

/** Settings with a format applied; an unknown id leaves them unchanged. */
export const applyLayoutFormat = (
    settings: ProjectSettings,
    formatId: string,
): ProjectSettings => {
    const format = LAYOUT_FORMATS.find(({ id }) => id === formatId);
    return format ? { ...clearLayout(settings), ...format.layout } : settings;
};

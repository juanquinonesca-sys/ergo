import type { LineSpacing } from "../../../bindings/LineSpacing";
import type { PageMargins } from "../../../bindings/PageMargins";
import type { ParagraphSpacing } from "../../../bindings/ParagraphSpacing";
import type { ProjectSettings } from "../../../bindings/ProjectSettings";
import { m } from "../../../paraglide/messages.js";
import { Select } from "../../atoms/Select/Select";
import { TextInput } from "../../atoms/TextInput/TextInput";
import { FormField } from "../../molecules/FormField/FormField";
import {
    applyLayoutFormat,
    clearLayout,
    DEFAULT_CUSTOM_MARGINS,
    LAYOUT_FORMATS,
    type LayoutFields,
} from "../../../settings/project/layoutFormats";
import styles from "./SettingsDialog.module.css";

/** Select value meaning "leave it to the template" (the field stays unset). */
const TEMPLATE_DEFAULT = "";
const CUSTOM = "custom";

const MARGIN_SIDES: { key: keyof PageMargins; label: () => string }[] = [
    { key: "top_cm", label: m.settings_margin_top },
    { key: "bottom_cm", label: m.settings_margin_bottom },
    { key: "left_cm", label: m.settings_margin_left },
    { key: "right_cm", label: m.settings_margin_right },
];

const parseCm = (value: string): number | undefined => {
    if (value.trim() === "") return undefined;
    const parsed = Number(value.replace(",", "."));
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
};

export interface PageLayoutSettingsProps {
    settings: ProjectSettings;
    onChange: (settings: ProjectSettings) => void;
}

/**
 * Margins, line spacing, paragraph spacing and first-line indent. Every field
 * defaults to the template's own value; a chosen value overrides the template.
 */
export const PageLayoutSettings = ({ settings, onChange }: PageLayoutSettingsProps) => {
    const update = (layout: Partial<LayoutFields>) => onChange({ ...settings, ...layout });
    const margins = settings.page_margins;

    return (
        <section className={styles.settingsGroup}>
            <h3>{m.settings_group_page_layout()}</h3>
            <div className={styles.fieldGrid}>
                <FormField label={m.settings_quick_format()}>
                    <Select
                        aria-label={m.settings_quick_format()}
                        fullWidth
                        value=""
                        options={[
                            { value: "", label: m.settings_quick_format_pick() },
                            ...LAYOUT_FORMATS.map(({ id, label }) => ({ value: id, label })),
                            { value: "reset", label: m.settings_layout_template_default() },
                        ]}
                        onChange={(event) => {
                            const choice = event.target.value;
                            onChange(
                                choice === "reset"
                                    ? clearLayout(settings)
                                    : applyLayoutFormat(settings, choice),
                            );
                        }}
                    />
                </FormField>
                <FormField label={m.settings_margins()}>
                    <Select
                        aria-label={m.settings_margins()}
                        fullWidth
                        value={margins ? CUSTOM : TEMPLATE_DEFAULT}
                        options={[
                            { value: TEMPLATE_DEFAULT, label: m.settings_layout_template_default() },
                            { value: CUSTOM, label: m.settings_layout_custom() },
                        ]}
                        onChange={(event) =>
                            update({
                                page_margins:
                                    event.target.value === CUSTOM
                                        ? (margins ?? DEFAULT_CUSTOM_MARGINS)
                                        : undefined,
                            })
                        }
                    />
                </FormField>
                {margins &&
                    MARGIN_SIDES.map(({ key, label }) => (
                        <FormField key={key} label={label()}>
                            <TextInput
                                aria-label={label()}
                                fullWidth
                                type="number"
                                min="0"
                                step="0.1"
                                value={String(margins[key])}
                                onChange={(event) => {
                                    const cm = parseCm(event.target.value);
                                    if (cm !== undefined) {
                                        update({ page_margins: { ...margins, [key]: cm } });
                                    }
                                }}
                            />
                        </FormField>
                    ))}
                <FormField label={m.settings_line_spacing()}>
                    <Select
                        aria-label={m.settings_line_spacing()}
                        fullWidth
                        value={settings.line_spacing ?? TEMPLATE_DEFAULT}
                        options={[
                            { value: TEMPLATE_DEFAULT, label: m.settings_layout_template_default() },
                            { value: "single", label: m.settings_line_spacing_single() },
                            { value: "one_and_half", label: m.settings_line_spacing_one_and_half() },
                            { value: "double", label: m.settings_line_spacing_double() },
                        ]}
                        onChange={(event) =>
                            update({
                                line_spacing:
                                    (event.target.value as LineSpacing) || undefined,
                            })
                        }
                    />
                </FormField>
                <FormField label={m.settings_paragraph_spacing()}>
                    <Select
                        aria-label={m.settings_paragraph_spacing()}
                        fullWidth
                        value={settings.paragraph_spacing ?? TEMPLATE_DEFAULT}
                        options={[
                            { value: TEMPLATE_DEFAULT, label: m.settings_layout_template_default() },
                            { value: "none", label: m.settings_paragraph_spacing_none() },
                            { value: "small", label: m.settings_paragraph_spacing_small() },
                            { value: "blank_line", label: m.settings_paragraph_spacing_blank_line() },
                        ]}
                        onChange={(event) =>
                            update({
                                paragraph_spacing:
                                    (event.target.value as ParagraphSpacing) || undefined,
                            })
                        }
                    />
                </FormField>
                <FormField label={m.settings_first_line_indent()}>
                    <TextInput
                        aria-label={m.settings_first_line_indent()}
                        fullWidth
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder={m.settings_layout_template_default()}
                        value={
                            settings.first_line_indent_cm === undefined
                                ? ""
                                : String(settings.first_line_indent_cm)
                        }
                        onChange={(event) =>
                            update({ first_line_indent_cm: parseCm(event.target.value) })
                        }
                    />
                </FormField>
            </div>
        </section>
    );
};

import type { Importance } from "../bindings/Importance";
import type { InputSchema } from "../bindings/InputSchema";
import type { FieldImportance } from "../components/atoms/FieldLabel/FieldLabel";

/** Only required fields show a label marker in the UI. */
export const fieldLabelImportance = (
    importance: Importance | null | undefined,
): FieldImportance | undefined =>
    importance === "required" ? "required" : undefined;

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

/** Empty string, empty list, or rich text whose spans hold only whitespace. */
const isEmptyInputValue = (value: unknown): boolean => {
    if (value === null || value === undefined) return true;
    if (typeof value === "string") return value.trim() === "";
    if (Array.isArray(value)) {
        return value.every(
            (item) =>
                isRecord(item) &&
                typeof item.text === "string" &&
                item.text.trim() === "",
        );
    }
    return false;
};

const countMissingIn = (schema: InputSchema, value: unknown): number => {
    if (schema.importance === "required" && isEmptyInputValue(value)) return 1;
    const properties =
        schema.type === "object"
            ? schema.properties
            : schema.type === "array" && schema.items?.type === "object"
              ? schema.items.properties
              : null;
    if (!properties) return 0;
    const records =
        schema.type === "object"
            ? [value]
            : Array.isArray(value)
              ? value
              : [];
    let missing = 0;
    for (const record of records) {
        if (!isRecord(record)) continue;
        for (const property of properties) {
            if (property.id) missing += countMissingIn(property, record[property.id]);
        }
    }
    return missing;
};

/**
 * Required template inputs (including required properties of object entries,
 * e.g. each author's name) that are still empty in `values`.
 */
export const countMissingRequired = (
    schemas: InputSchema[],
    values: Record<string, unknown>,
): number =>
    schemas.reduce(
        (sum, schema) => sum + (schema.id ? countMissingIn(schema, values[schema.id]) : 0),
        0,
    );

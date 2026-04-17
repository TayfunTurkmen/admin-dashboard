import { displayValue } from "../utils/displayValue";

export function EllipsisCell({ text, maxWidth = "14ch" }) {
  const label = displayValue(text);
  return (
    <span className="ellipsis-cell" style={{ maxWidth }} title={label}>
      {label}
    </span>
  );
}

import { displayValue } from "../utils/displayValue";

export function TruncatedText({ value, maxLength = 20, className }) {
  const str = displayValue(value);
  if (str.length <= maxLength) {
    return <span className={className}>{str}</span>;
  }
  const visible = Math.max(0, maxLength - 1);
  return (
    <span className={className} title={str}>
      {str.slice(0, visible)}…
    </span>
  );
}

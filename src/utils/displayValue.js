export function displayValue(value) {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (typeof value === "object" && typeof value.latitude === "number" && typeof value.longitude === "number") {
    return `${value.latitude}, ${value.longitude}`;
  }
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "object" && typeof value.toDate === "function") {
    try {
      return value.toDate().toISOString().slice(0, 10);
    } catch {
      return "";
    }
  }
  if (typeof value === "object" && typeof value.seconds === "number") {
    return new Date(value.seconds * 1000).toISOString().slice(0, 10);
  }
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "";
    }
  }
  return String(value);
}

export function displayNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function toDateInputValue(value) {
  const s = displayValue(value);
  if (!s) return "";
  return s.slice(0, 10);
}

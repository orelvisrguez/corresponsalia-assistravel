// Date utility functions for Argentina timezone (America/Argentina/Buenos_Aires)

const ARGENTINA_TIMEZONE = "America/Argentina/Buenos_Aires";

/**
 * Format a date to display in Argentina timezone (Buenos Aires)
 * @param date - Date string, Date object, or null/undefined
 * @returns Formatted date string in dd/MM/yyyy format
 */
export function formatDateArgentina(date: string | Date | null | undefined): string {
  if (!date) return "—";
  try {
    return new Date(date).toLocaleDateString("es-AR", {
      timeZone: ARGENTINA_TIMEZONE,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

/**
 * Format a date with time to display in Argentina timezone (Buenos Aires)
 * @param date - Date string, Date object, or null/undefined
 * @returns Formatted date and time string
 */
export function formatDateTimeArgentina(date: string | Date | null | undefined): string {
  if (!date) return "—";
  try {
    return new Date(date).toLocaleString("es-AR", {
      timeZone: ARGENTINA_TIMEZONE,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

/**
 * Format a date for input fields (YYYY-MM-DD) in Argentina timezone
 * @param date - Date string, Date object, or null/undefined
 * @returns Formatted date string in YYYY-MM-DD format
 */
export function formatDateForInput(date: string | Date | null | undefined): string {
  if (!date) return "";
  try {
    const d = new Date(date);
    // Adjust for timezone to get the correct date in Argentina
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch {
    return "";
  }
}

/**
 * Format a currency value in Argentine Pesos (es-AR)
 * @param value - Numeric value
 * @param symbol - Currency symbol (default: $)
 * @returns Formatted currency string
 */
export function formatCurrencyArgentina(value: number | null | undefined, symbol: string = "$"): string {
  if (value === null || value === undefined) return "—";
  return `${symbol} ${value.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format a USD value
 * @param value - Numeric value in USD
 * @returns Formatted USD string
 */
export function formatUsdArgentina(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return `USD ${value.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

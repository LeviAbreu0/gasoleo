/**
 * Date helpers: API uses ISO `YYYY-MM-DD`; UI uses Brazilian `dd/mm/aaaa`.
 */

const BR_RE = /^(\d{2})[/-](\d{2})[/-](\d{4})$/;
const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Convert API/storage ISO date to display string dd/mm/yyyy */
export function isoDateToBr(iso: string): string {
  const s = String(iso).trim().slice(0, 10);
  const m = ISO_RE.exec(s);
  if (!m) return iso;
  const [, y, mo, d] = m;
  return `${d}/${mo}/${y}`;
}

/** Convert typed display date to ISO for the API */
export function brDateToIso(br: string): string {
  const m = BR_RE.exec(String(br).trim());
  if (!m) throw new Error("Data inválida (use dd/mm/aaaa)");
  const [, dd, mm, yyyy] = m;
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Parse entry date for sorting and calendar logic.
 * Handles ISO YYYY-MM-DD and BR dd/mm/yyyy; uses local noon to reduce TZ drift.
 */
export function parseEntryDateToLocalDate(s: string): Date {
  if (!s) return new Date(NaN);
  const t = String(s).trim();
  let m = ISO_RE.exec(t.slice(0, 10));
  if (m) {
    const [, y, mo, d] = m;
    return new Date(Number(y), Number(mo) - 1, Number(d), 12, 0, 0, 0);
  }
  m = BR_RE.exec(t);
  if (m) {
    const [, dd, mm, yyyy] = m;
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd), 12, 0, 0, 0);
  }
  const fallback = new Date(t);
  return isNaN(fallback.getTime()) ? new Date(NaN) : fallback;
}

/** Compare two entries for "newest first" (date desc, then id desc). */
export function compareNewestFirst(
  a: { date: string; id?: string },
  b: { date: string; id?: string }
): number {
  const da = parseEntryDateToLocalDate(a.date);
  const db = parseEntryDateToLocalDate(b.date);
  const diff = db.getTime() - da.getTime();
  if (diff !== 0) return diff;
  const idA = String(a.id ?? "");
  const idB = String(b.id ?? "");
  return idB.localeCompare(idA, undefined, { numeric: true });
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function timeAgo(iso: string, now = Date.now()): string {
  const mins = Math.max(0, Math.round((now - Date.parse(iso)) / 60_000));
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d`;
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

/** Times are stored as local wall-clock strings (no zone), as temples publish them. */
function parts(local: string) {
  const d = new Date(local);
  return { d, h: d.getHours(), m: d.getMinutes() };
}

export function clock(local: string): string {
  const { h, m } = parts(local);
  const hour = h % 12 === 0 ? 12 : h % 12;
  const mm = m === 0 ? '' : `:${String(m).padStart(2, '0')}`;
  return `${hour}${mm} ${h < 12 ? 'AM' : 'PM'}`;
}

export function clockLong(local: string): string {
  const { h, m } = parts(local);
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

export const monthShort = (local: string) => MONTHS[new Date(local).getMonth()].toUpperCase();
export const dayOfMonth = (local: string) => new Date(local).getDate();
export const weekdayShort = (local: string) => DAYS[new Date(local).getDay()];

export function dateLong(local: string): string {
  const d = new Date(local);
  return `${DAYS_LONG[d.getDay()]}, ${MONTHS_LONG[d.getMonth()]} ${d.getDate()}`;
}

export function todayLabel(now = new Date()): string {
  return `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}`;
}

export const count = (n: number) => n.toLocaleString('en-US');

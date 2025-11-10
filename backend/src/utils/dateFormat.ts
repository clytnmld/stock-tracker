import moment from 'moment-timezone';

export function formatDateToJakarta(date: Date): string {
  return moment(date).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');
}

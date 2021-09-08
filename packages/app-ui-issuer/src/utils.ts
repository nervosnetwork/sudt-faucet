import moment from 'moment';

export function formatTimeSpan(time: number): string {
  return moment(time).format('YYYY-MM-DD HH:mm');
}

import dayjs from 'dayjs';

export const today = () => dayjs().format('YYYY-MM-DD');

export const formatDate = (date: string) => dayjs(date).format('ddd, MMM D');

export const formatDateLong = (date: string) => dayjs(date).format('MMMM D, YYYY');

export const isSameDay = (a: string, b: string) => dayjs(a).isSame(dayjs(b), 'day');

export const subtractDays = (n: number) => dayjs().subtract(n, 'day').format('YYYY-MM-DD');

export const daysAgo = (date: string) => dayjs().diff(dayjs(date), 'day');

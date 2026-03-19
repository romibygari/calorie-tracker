import dayjs from 'dayjs';

export const today = () => dayjs().format('YYYY-MM-DD');
export const formatDate = (d: string) => dayjs(d).format('ddd, MMM D');
export const formatDateLong = (d: string) => dayjs(d).format('MMMM D, YYYY');

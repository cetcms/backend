import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

export const DateHandler = (date?: dayjs.ConfigType) => {
  return dayjs(date);
};

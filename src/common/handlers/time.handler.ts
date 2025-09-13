import type dayjs from 'dayjs';

export const TimeHandler = () => {
  return {
    serialize: (time: string) => {
      const value = parseInt(time);
      const unit: dayjs.ManipulateType = time.replace(/[0-9]/g, '') as any;
      return {
        value,
        unit,
      };
    },
  };
};

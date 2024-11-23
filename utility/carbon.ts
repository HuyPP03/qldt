import dayjs from "dayjs";

interface Carbon {
  now: () => any;
  create: (date: Date | string) => dayjs.Dayjs;
  currentDate: () => string;
  currentDatetime: () => string;
  currentTime: () => string;
  formatDate: (
    date: string | Date,
    formatClientDate?: string,
    currentFormat?: string
  ) => string;
}

export const carbon: dayjs.Dayjs & Carbon = dayjs as any;

carbon.now = () => {
  return dayjs();
};

carbon.create = (date: Date | string) => {
  return dayjs(date);
};

carbon.currentDate = (): string => {
  return dayjs().format("YYYY-MM-DD");
};

carbon.currentDatetime = () => {
  return dayjs().format("YYYY-MM-DD HH:mm:ss");
};

carbon.currentTime = () => {
  return dayjs().format("HH:mm:ss");
};

carbon.formatDate = (
  date: string | Date,
  formatClientDate = "DD/MM/YYYY",
  currentFormat?: string
) => {
  if (currentFormat) return dayjs(date, currentFormat).format(formatClientDate);
  return dayjs(date).format(formatClientDate);
};

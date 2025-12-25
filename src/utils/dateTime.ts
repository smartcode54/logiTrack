import type { Timestamp } from "@/types";

/**
 * สร้าง timestamp ในรูปแบบไทย (พ.ศ.)
 */
export const createTimestamp = (): Timestamp => {
  const date = new Date();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear() + 543; // พ.ศ.
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  const dateString = `${day}/${month}/${year}`;
  const timeString = `${hours}:${minutes}:${seconds}`;

  return { date: dateString, time: timeString };
};

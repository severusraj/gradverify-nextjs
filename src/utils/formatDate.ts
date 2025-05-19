import { toZonedTime, format } from "date-fns-tz";

export function formatToPhilippinesTime(utcDateString: string) {
	const timeZone = "Asia/Manila";
	const zonedDate = toZonedTime(utcDateString, timeZone);
	return format(zonedDate, "yyyy-MM-dd HH:mm:ss (zzz)", { timeZone });
}

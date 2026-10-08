const timeFormat = new Intl.DateTimeFormat("ru-RU", {
  hour: "2-digit",
  minute: "2-digit",
});

// время в формате ЧЧ:ММ
export function formatTime(timestamp: number): string {
  return timeFormat.format(timestamp);
}

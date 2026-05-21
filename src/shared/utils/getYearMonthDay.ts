function padTo2Digits(num) {
  return num.toString().padStart(2, '0');
}

export function getYearMonthDay(date = new Date()) {
  const year = date.getFullYear();
  const month = padTo2Digits(date.getMonth() + 1);
  const day = padTo2Digits(date.getDate());

  return { year, month, day };
}

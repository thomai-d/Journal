const pad = (n: number, pad: number) => {
  let str = n.toString();
  while (str.length < pad) {
    str = '0' + str;
  }
  return str;
}

export const printDate = (dateStr: string) => {
  const date = new Date(Date.parse(dateStr));
  return `${date.getFullYear()}-${pad(date.getMonth() + 1, 2)}-${pad(date.getDate(), 2)} ${pad(date.getHours(), 2)}:${pad(date.getMinutes(), 2)}`;
}
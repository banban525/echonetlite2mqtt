

export function toUtcDateTimeText(date:Date):string
{
  const year = date.getUTCFullYear().toString().padStart(4, "0");
  const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const day = date.getUTCDate().toString().padStart(2, "0");
  const hour = date.getUTCHours().toString().padStart(2, "0");
  const minute = date.getUTCMinutes().toString().padStart(2, "0");
  const second = date.getUTCSeconds().toString().padStart(2, "0");
  
  const utcText = `${year}-${month}-${day} ${hour}:${minute}:${second}Z`;
  return utcText;
}

export function getUtcNowDateTimeText():string
{
  return toUtcDateTimeText(new Date());
}
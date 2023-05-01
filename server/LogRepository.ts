import { getUtcNowDateTimeText } from "./datetimeLib";
import { Logger } from "./Logger";

export interface log
{
  id:number;
  datetime:string;
  message:string;
}


export class LogRepository
{
  logs:log[] = [];
  lastId = 0;
  output = (message:string):void => {
    Logger.info("", message);
    this.lastId++;
    this.logs.push({
      id: this.lastId,
      datetime: getUtcNowDateTimeText(),
      message: message
    });
    if(this.logs.length > 200){
      this.logs.splice(0, 1);
    }
  }
}
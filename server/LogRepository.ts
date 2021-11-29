
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
    console.log(message);
    this.lastId++;
    this.logs.push({
      id: this.lastId,
      datetime: new Date().toISOString(),
      message: message
    });
    if(this.logs.length > 200){
      this.logs.splice(0, 1);
    }
  }
}
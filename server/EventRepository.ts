

interface EventRecord{
  id: string;
  event:string;
}

export class EventRepository
{
  constructor()
  {
    this.lastId = this.createId();
  }

  private createId = ():string =>{
    this.counter++;
    if(this.counter > 100000){
      this.counter = 0;
    }
    return new Date().toISOString() + "_" + this.counter;
  }


  eventRecords:EventRecord[] = [];
  lastId: string;
  counter = 0;
  newEvent = (event:string):void => {
    this.lastId = this.createId();
    this.eventRecords.push({
      id: this.lastId ,
      event: event
    });
    if(this.eventRecords.length > 200){
      this.eventRecords.shift();
    }

    if(event === "SYSTEM")
    {
      Object.keys(this.callbackMap).forEach((key) => {
        this.callbackMap[key]("systemUpdated", "");
      });
    }
    else if(event === "LOG")
    {
      Object.keys(this.callbackMap).forEach((key) => {
        this.callbackMap[key]("logUpdated", "");
      });
    }
    else
    {
      Object.keys(this.callbackMap).forEach((key) => {
        this.callbackMap[key]("deviceUpdated", event);
      });
    }
  }

  existsNewEvents = (lastId:string):boolean =>{
    return lastId !== this.lastId;
  }


  getNewEvents = (lastId: string): {id: string, events:string[]} =>{
    let index = this.eventRecords.findIndex(_=>_.id === lastId);

    if(index < 0){
      index = -1;
    }
    const targetEvents = this.eventRecords.slice(index + 1);
    const uniqueEvents = [...new Set(targetEvents.map(_=>_.event))];
    return {
      id: this.lastId,
      events: uniqueEvents
    };
    
  }

  callbackMap:{[key:string]:(eventName:string, deviceId:string)=>Promise<void>} = {};

  addEventCallback = (eventReceiverId:string, 
    callback:(eventName:string, deviceId:string)=>Promise<void>):void => {
    
      this.callbackMap[eventReceiverId] = callback;
  }

  removeEventCallback = (eventReceiverId:string):void => {
    delete this.callbackMap[eventReceiverId];
  }
}


import { getUtcNowDateTimeText, toUtcDateTimeText } from "./datetimeLib";
import { Logger } from "./Logger";
import { HoldOption } from "./MqttController";
import { DeviceId } from "./Property";

interface holdStatus
{
  id:DeviceId;
  propertyName:string;
  value:any;
  startTime:string;
  expireDateTime:string;
  nextCheckTime:string;
  sent:boolean;
  holdOption:HoldOption;
}

export interface HoldControllerActions
{
  request:(deviceId:DeviceId, propertyName:string)=>void;
  set:(deviceId:DeviceId, propertyName:string, newValue:any)=>void;
  isBusy:()=>boolean;
}

export class EchoNetHoldController
{
  constructor(actions:HoldControllerActions)
  {
    this.actions = actions;
  }
  private readonly actions:HoldControllerActions;
  private _list:holdStatus[] = [];
  private _removedList:holdStatus[] = [];
  private _intervalTimer:NodeJS.Timer|undefined = undefined;
  setHold = (id:DeviceId, propertyName:string, value:any, holdOption: HoldOption)=>
  {
    if(holdOption.holdTime <= 0)
    {
      this.clearHold(id, propertyName);
      return;
    }

    let expired = new Date();
    expired.setSeconds(expired.getSeconds() + holdOption.holdTime);
    let nextCheckTime = new Date();
    nextCheckTime.setSeconds(nextCheckTime.getSeconds() + holdOption.checkInterval);

    this.clearHold(id, propertyName);
    this._list = this._list.filter(_=>(_.id.id === id.id && _.propertyName == propertyName)===false);
    this._list.push({
      id,
      propertyName,
      value,
      startTime: getUtcNowDateTimeText(),
      expireDateTime: toUtcDateTimeText(expired),
      nextCheckTime: toUtcDateTimeText(nextCheckTime),
      sent: false,
      holdOption: holdOption
    });

    if(this._intervalTimer === undefined)
    {
      this._intervalTimer = setInterval(this.procInterval, 1000);
    }
  }
  
  clearHold = (id:DeviceId, propertyName:string):void=>
  {
    const found = this._list.find(_=>_.id.id === id.id && _.propertyName == propertyName);
    if(found !== undefined)
    {
      this._removedList.push(found);
      this._removedList = this._removedList.slice(-100);
      Logger.info("[ECHONETLite][hold]", `clear setting ${id.id} ${propertyName}`);
      this._list = this._list.filter(_=>(_.id.id === id.id && _.propertyName == propertyName)===false);
    }
  }

  fireRequestEvent = (deviceId:DeviceId, propertyName:string):void=>{
    this.actions.request(deviceId, propertyName);
  }

  procInterval = ():void =>
  {
    const now = getUtcNowDateTimeText();
    
    const isBusy = this.actions.isBusy();
    for(const status of this._list)
    {
      if(status.nextCheckTime <= now)
      {
        if(isBusy === false)
        {
          // request
          status.sent = false;
          this.fireRequestEvent(status.id, status.propertyName);
        }
        else
        {
          // skip
          Logger.debug("[ECHONETLite][hold]", `skip because busy`);
        }

        // 次回のチェックする時刻を設定する
        let date = new Date();
        date.setSeconds(date.getSeconds() + status.holdOption.checkInterval);
        status.nextCheckTime = toUtcDateTimeText(date);
      }
    }

    const endedHoldStatusList = this._list.filter(_=>_.expireDateTime <= now);
    for(const endedHoldStatus of endedHoldStatusList)
    {
      Logger.info("[ECHONETLite][hold]", `end setting ${endedHoldStatus.id.id} ${endedHoldStatus.propertyName}`);
    }
    this._removedList.push(...endedHoldStatusList);
    this._removedList = this._removedList.slice(-100);


    this._list = this._list.filter(_=>_.expireDateTime > now);

    if(this._list.length === 0 && this._intervalTimer!==undefined)
    {
      const lastIntervalTime = this._intervalTimer;
      this._intervalTimer = undefined;
      clearInterval(lastIntervalTime);
    }
  }

  receivedProperty = (id:DeviceId, propertyName:string, newValue:any):void =>
  {
    const match = this._list.find(_=>_.id.id === id.id && _.propertyName == propertyName);
    if(match === undefined)
    {
      return;
    }
    if(match.value !== newValue)
    {
      if(match.sent)
      {
        return;
      }
      // set Value
      Logger.info("[ECHONETLite][hold]", `set value ${id.id} ${propertyName} ${match.value}`);
      match.sent = true;
      this.actions.set(id, propertyName, match.value);
    }
  }

  public getInternalStatus = ():unknown=>
  {
    return {
      current: this._list,
      history: this._removedList
    }
  }
}
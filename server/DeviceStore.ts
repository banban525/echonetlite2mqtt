import dayjs from "dayjs";
import { Device } from "./Property";


export class DeviceStore{

    private list:Device[] = [];
  
    public exists = (id:string):boolean=>{
      return this.list.find(_=>_.id === id) !== undefined;
    }
    public add = (device:Device):void=>{
      this.list.push(device);
    }
    public get = (id:string):Readonly<Device>|undefined => {
      return this.list.find(_=>_.id === id);
    }
    public getFromNameOrId = (id:string):Readonly<Device>|undefined => {
      const found = this.list.find(_=>_.name === id);
      if(found !== undefined)
      {
        return found;
      }
      return this.get(id);
    }
    public getAll = ():Readonly<Device>[] => {
      return this.list.slice();
    }
    public getIds = ():string[] => {
      return this.list.map(_=>_.id);
    }
  
    public getProperty = (id:string, propertyName:string):any|undefined=>{
      const device = this.list.find(_=>_.id === id);
      if(device === undefined){
        return undefined;
      }
      if((propertyName in device.propertiesValue)===false)
      {
        return undefined;
      }
      return device.propertiesValue[propertyName].value;
    }
    public changeProperty = (id:string, propertyName:string, newValue:any):void =>{
      const device = this.list.find(_=>_.id === id);
      if(device === undefined){
        return;
      }
      if((propertyName in device.propertiesValue)===false)
      {
        return;
      }
      device.propertiesValue[propertyName].value=newValue;
      device.propertiesValue[propertyName].updated=dayjs(Date()).format("YYYY-MM-DD HH:mm:ss");
    }
  }
  
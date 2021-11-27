import { device } from "./Property";


export class DeviceStore{

    private list:device[] = [];
  
    public exists = (id:string):boolean=>{
      return this.list.find(_=>_.id === id) !== undefined;
    }
    public add = (device:device):void=>{
      this.list.push(device);
    }
    public get = (id:string):Readonly<device>|undefined => {
      return this.list.find(_=>_.id === id);
    }
    public getAll = ():Readonly<device>[] => {
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
      return device.propertiesValue[propertyName];
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
      device.propertiesValue[propertyName]=newValue;
    }
  }
  
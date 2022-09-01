import { ElPropertyDescription } from "./MraTypes";

export interface Manufacturer{
  code: string;
  descriptions:{
    ja:string;
    en:string;
  }
}

export interface PropertyValue
{
  name:string;
  deviceProperty:Property;
  value:any;
  updated:string; // YYYY-NN-DD HH:mm:ss
}

export interface Device{
  id:string;
  ip:string;
  deviceType:string;
  eoj:string;
  descriptions:{
    ja:string;
    en:string;
  };
  properties:Property[];
  protocol: {
    type:string;
    version:string;
  };
  manufacturer:Manufacturer;
  propertiesValue: {[key:string]:PropertyValue};
}

export class Device{
  public static ToProperiesObject(propertyValues:{[key:string]:PropertyValue}):{[key:string]:any}
  {
    const result:{[key:string]:any}= {};
    for(const name in propertyValues)
    {
      result[name] = propertyValues[name].value;
    }

    return result;
  }
}


export interface Property {
  name:string;
  epc:string;
  descriptions:{
      ja:string;
      en:string;
  },
  readable: boolean;
  writable:boolean;
  observable: boolean;
  schema:ElPropertyDescription;
}

export interface DeviceId {
  id:string;
  ip:string;
  eoj:string;
}
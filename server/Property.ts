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
  name:string;
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

export interface DeviceAlias
{
  id:string;
  name:string;
}

export interface AliasOption
{
  aliases: DeviceAlias[];
}

export class AliasOption
{
  public static empty: Readonly<AliasOption> = {
    aliases: []
  };
  public static validate(aliasOption:AliasOption):boolean
  {
    if(aliasOption.aliases===undefined)
    {
      return false;
    }
    if(Array.isArray(aliasOption.aliases)===false)
    {
      return false;
    }
    for(const deviceAlias of aliasOption.aliases)
    {
      if(deviceAlias.id === undefined)
      {
        return false;
      }
      if(deviceAlias.name === undefined)
      {
        return false;
      }
    }

    return true;
  }
}
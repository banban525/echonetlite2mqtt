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
  updated:string; // YYYY-NN-DD HH:mm:ssZ (UTC)
}

export interface Device{
  id:string;
  name:string;
  ip:string;
  deviceType:string;
  eoj:string;
  internalId:string;
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
  internalId:string;
}

export interface DeviceAlias
{
  id?:string;
  eoj?:string;
  ip?:string;
  name:string;
}

export interface ValidationResult
{
  valid:boolean;
  message:string;
}

export class DeviceAlias
{
  static validate(deviceAlias:DeviceAlias):ValidationResult
  {
    let message = "";
    if(deviceAlias.id !== undefined && deviceAlias.id.match(/[^0-9a-fA-F\*]/) !== null)
    {
      message = "id must be hexadecimal or '*' : " + deviceAlias.id;
    }
    if(deviceAlias.eoj !== undefined && deviceAlias.eoj.match(/[^0-9a-fA-F\*]/) !== null)
    {
      message = "eoj must be hexadecimal or '*' : " + deviceAlias.eoj;
    }
    if(deviceAlias.ip !== undefined && deviceAlias.ip.match(/[^0-9\.\*]/) !== null)
    {
      message = "ip must decimal number , '.' or '*' : " + deviceAlias.ip;
    }
    
    if(message === "")
    {
      return {valid:true, message};
    }
    else
    {
      return {valid:false, message};
    }
  }
  static isMatch(deviceAlias:DeviceAlias, id:string, eoj:string, ip:string):boolean
  {
    // deviceAliasのid,eoj,ipのうち、undefinedでないものがdeviceIdと一致しているか確認する
    // これらのid,eoj,ipの中に含まれる * はワイルドカードとして扱うので、正規表現でマッチングする
    if(deviceAlias.id !== undefined)
    {
      if(id.match(deviceAlias.id.replace(/\*/gi, ".*")) === null)
      {
        return false;
      }
    }
    if(deviceAlias.eoj !== undefined)
    {
      if(eoj.match(deviceAlias.eoj.replace(/\*/gi, ".*")) === null)
      {
        return false;
      }
    }
    if(deviceAlias.ip !== undefined)
    {
      // ipは正規表現のエスケープをしてから比較する
      if(ip.match(deviceAlias.ip.replace(/\./gi, "\\.").replace(/\*/g, ".*")) === null)
      {
        return false;
      }
    }

    return true;
  }
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
  public static validate(aliasOption:AliasOption):ValidationResult
  {
    if(aliasOption.aliases===undefined)
    {
      return {valid:false, message:"aliases is undefined"};
    }
    if(Array.isArray(aliasOption.aliases)===false)
    {
      return {valid:false, message:"aliases is not array"};
    }

    const faildValidationResults = aliasOption.aliases
      .map(_=>DeviceAlias.validate(_)).filter(_=>_.valid===false);
    if(faildValidationResults.length>0)
    {
      return {valid:false, 
        message:faildValidationResults.map(_=>_.message).join("\n")};
    }

    return {valid:true, message:""};
  }
}
import EL from "echonet-lite";
import { DevicePropertySchema, MixedTypePropertySchema } from "./AllDeviceDescriptions";
import { Property } from "./Property";

export interface EchoNetParseData{
  schema: DevicePropertySchema;
  data:string;
  rootProperty:Property;
}

export interface Converter<T>{
  toEchoNetLiteData(schema: DevicePropertySchema, rootProperty:Property, data:T, currentData:string): string|undefined;
  toValue(echoNetData: EchoNetParseData): T|undefined;
}

export class StringConverter implements Converter<string>{
  toEchoNetLiteData(schema: DevicePropertySchema, rootProperty:Property, data:string, currentData:string): string|undefined{
    return data;
  }
  toValue(echoNetData: EchoNetParseData): string|undefined{
    return echoNetData.data;
  }}

export class UnknownConverter<T>{
  toEchoNetLiteData(schema: DevicePropertySchema, rootProperty:Property, data:T, currentData:string): undefined{
    return undefined;
  }
  toValue(echoNetData: EchoNetParseData): undefined{
    return undefined;
  }
}

export class DefaultConverter<T> implements Converter<T>{
  toEchoNetLiteData(schema: DevicePropertySchema, rootProperty: Property, data: T, currentData:string): string|undefined {
    if("type" in schema)
    {
      if(schema.type === "boolean" && typeof(data) === "boolean")
      {
        const matched = schema.values.find(_=>_.value === data);
        return matched?.edt?.substring(2).toLowerCase();
      }
      else if(schema.type === "number" && typeof(data) === "number")
      {
        let returnValue:number = data;
        if(schema.maximum !== undefined && data > schema.maximum) {
          return undefined;
        }
        if(schema.minimum !== undefined && data < schema.minimum){
          return undefined;
        }
        if(schema.multipleOf !== undefined)
        {
          returnValue /= schema.multipleOf;
        }

        const numArray:number[] = [];
        returnValue = Math.round(returnValue);
        for(let i = 0; i < currentData.length/2; i++)
        {
          numArray.push(returnValue % 0xff);
          returnValue /= 0xff;
        }
        const returnValueText = EL.bytesToString(numArray);
        return returnValueText;
      }
      else if(schema.type === "string" && typeof(data) === "string")
      {
        if(schema.format !== undefined)
        {
          if(schema.format === "date")
          {
            const matches = data.match(/([0-9]{4})\-([0-9]{2})\-([0-9]{2})/);
            if(matches!==null){
              
              const year = Number(matches[0]);
              const month = Number(matches[1]);
              const day = Number(matches[2]);
              
              const array:number[] = [];
              array.push(year / 256);
              array.push(year % 256);
              array.push(month);
              array.push(day);
              return EL.bytesToString(array);
            }
          }
          if(schema.format === "time")
          {
            let matches = data.match(/([0-9]{2}):([0-9]{2}):([0-9]{2})/);
            if(matches !== null){
              const hour = Number(matches[0]);
              const minite = Number(matches[1]);
              const second = Number(matches[2]);
              const array:number[] = [];
              array.push(hour);
              array.push(minite);
              array.push(second);
              return EL.bytesToString(array);
            }

            matches = data.match(/([0-9]{2}):([0-9]{2})/)
            if(matches !== null){
              const hour = Number(matches[0]);
              const minite = Number(matches[1]);
              const array:number[] = [];
              array.push(hour);
              array.push(minite);
              return EL.bytesToString(array);
            }
          }
          if(schema.format === "date-time")
          {
            let matches = data.match(/([0-9]{4})\-([0-9]{2})\-([0-9]{2}) ([0-9]{2}):([0-9]{2}):([0-9]{2})/);
            if(matches !== null){
              const year = Number(matches[0]);
              const month = Number(matches[1]);
              const day = Number(matches[2]);
              const hour = Number(matches[3]);
              const minite = Number(matches[4]);
              const second = Number(matches[5]);

              const array:number[] = [];
              array.push(year / 256);
              array.push(year % 256);
              array.push(month);
              array.push(day);
              array.push(hour);
              array.push(minite);
              array.push(second);
              return EL.bytesToString(array);
            }

            matches = data.match(/([0-9]{4})\-([0-9]{2})\-([0-9]{2}) ([0-9]{2}):([0-9]{2})/);
            if(matches !== null){
              const year = Number(matches[0]);
              const month = Number(matches[1]);
              const day = Number(matches[2]);
              const hour = Number(matches[3]);
              const minite = Number(matches[4]);

              const array:number[] = [];
              array.push(year / 256);
              array.push(year % 256);
              array.push(month);
              array.push(day);
              array.push(hour);
              array.push(minite);
              return EL.bytesToString(array);
            }
          }
        }
        const matched = schema.values?.find(_=>_.value === data);
        return matched?.edt?.substring(2).toLowerCase();
      }
      else if(schema.type === "null")
      {
        return "";
      }
      else if(schema.type === "array")
      {
        return undefined;
      }
      else if(schema.type === "object")
      {
        return undefined;
      }
    }
    else{
      const mixedTypePropertySchema = schema as MixedTypePropertySchema;
        
      // valuesを持つスキーマが優先
      const prioritySchemaArray = mixedTypePropertySchema.oneOf.filter((_):boolean=>{
        if("type" in _){
          if(_.type === "boolean")
          {
            return true;
          }
          if(_.type === "string")
          {
            if(_.values !== undefined)
            {
              return true;
            }
          }
        }
        return false;
      });

      for(const schema of prioritySchemaArray)
      {
        const value = this.toEchoNetLiteData(schema, rootProperty, data, currentData);
        if(value !== undefined)
        {
          return value;
        }
      }

      const otherSchemaArray = mixedTypePropertySchema.oneOf.filter(_=>prioritySchemaArray.indexOf(_)<0);
      for(const schema of otherSchemaArray)
      {
        const value = this.toEchoNetLiteData(schema, rootProperty, data, currentData);
        if(value !== undefined)
        {
          return value;
        }
      }
    }  
    return undefined;
  }
  toValue(echoNetData: EchoNetParseData): T|undefined {
    return defaultParser(echoNetData);
  }
}

export function UknownParser(echoNetdata: EchoNetParseData): any {
  return undefined;
}

export function defaultParser(echoNetdata: EchoNetParseData): any {
    
  const schema = echoNetdata.schema;
  const data = echoNetdata.data;
  const rootProperty = echoNetdata.rootProperty;


  if("type" in schema)
  {
    if(schema.type === "boolean")
    {
      const valueSchema = schema.values.find(_=>_.edt?.substring(2).toLowerCase() === data);
      const value = valueSchema?.value ?? false;
      return value;
    }
    else if(schema.type === "number")
    {
      let numberValue:number = 0;
      for(let i = 0; i < data.length; i+=2)
      {
        numberValue *= 256;
        numberValue += parseInt( data.substr(i, 2), 16);
      }
      if(schema.multipleOf !== undefined)
      {
        numberValue *= schema.multipleOf;
      }

      if(schema.minimum !== undefined)
      {
        if(numberValue < schema.minimum)
        {
          return undefined;
        }
      }

      if(schema.maximum !== undefined)
      {
        if(numberValue > schema.maximum)
        {
          return undefined;
        }
      }
      return numberValue;
      
    }
    else if(schema.type === "string")
    {
      if(schema.format !== undefined)
      {
        if(schema.format === "date")
        {
          const year = parseInt( data.substring(0, 4), 16);
          const month = parseInt( data.substring(4, 2), 16);
          const day = parseInt( data.substring(6, 2), 16);
          return `${year}-${month}-${day}`;
        }
        if(schema.format === "time")
        {
          const hours = parseInt( data.substring(0, 2), 16);
          const minutes = data.length >=4 ?parseInt( data.substring(2, 2), 16) : -1;
          const seconds = data.length >=6 ? parseInt( data.substring(4, 2), 16) : -1;
          if(minutes === -1)
          {
            return `${hours}:00:00`;
          }
          if(seconds === -1)
          {
            return `${hours}:${minutes}:00`;
          }
          return `${hours}:${minutes}:${seconds}`;
        }
        if(schema.format === "date-time")
        {
          const year = parseInt( data.substring(0, 4), 16);
          const month = parseInt( data.substring(4, 2), 16);
          const day = parseInt( data.substring(6, 2), 16);
          const hours = parseInt( data.substring(8, 2), 16);
          const minutes = data.length >=12 ? parseInt( data.substring(10, 2), 16) : -1;
          const seconds = data.length >=14 ? parseInt( data.substring(12, 2), 16) : -1;

          if(minutes === -1)
          {
            return `${year}-${month}-${day} ${hours}:00:00`;
          }
          if(seconds === -1)
          {
            return `${year}-${month}-${day} ${hours}:${minutes}:00`;
          }
          return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        }
      }
      const propValue = data.toLowerCase();
      const valueSchema = schema.values?.find(_=>_.edt?.substring(2).toLowerCase() === propValue);
      const value = valueSchema?.value;
      return value;
    }
    else if(schema.type === "null")
    {
      const value = "";
      return value;
    }
    else if(schema.type === "array")
    {
      return undefined;
    }
    else if(schema.type === "object")
    {
      return undefined;
    }
  }
  else{
    const mixedTypePropertySchema = schema as MixedTypePropertySchema;
    
    // valuesを持つスキーマが優先
    const prioritySchemaArray = mixedTypePropertySchema.oneOf.filter((_):boolean=>{
      if("type" in _){
        if(_.type === "boolean")
        {
          return true;
        }
        if(_.type === "string")
        {
          if(_.values !== undefined)
          {
            return true;
          }
        }
      }
      return false;
    });

    for(const schema of prioritySchemaArray)
    {
      const value = defaultParser({data:echoNetdata.data, schema:schema, rootProperty:echoNetdata.rootProperty});
      if(value !== undefined)
      {
        return value;
      }
    }

    const otherSchemaArray = mixedTypePropertySchema.oneOf.filter(_=>prioritySchemaArray.indexOf(_)<0);
    for(const schema of otherSchemaArray)
    {
      const value = defaultParser({data:echoNetdata.data, schema:schema, rootProperty:echoNetdata.rootProperty});
      if(value !== undefined)
      {
        return value;
      }
    }

    return undefined;
    
  }
  return undefined;
}
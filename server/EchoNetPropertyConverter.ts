import { ElArrayType, ElBitmapType, ElDataType, ElDateTimeType, ElDateType, ElDefinitions, ElDeviceDescription, ElLevelType, ElMixedOneOfType, ElNumberType, ElNumericValueType, ElObjectType, ElPropertyDescription, ElRawType, ElStateType, ElTimeType } from "./MraTypes";
import path from "path";
import fs from "fs";
import { OpenAPIV3 } from "openapi-types";
import { Manufacturer, Protocol } from "./Property";

// https://stackoverflow.com/questions/13468474/javascript-convert-a-hex-signed-integer-to-a-javascript-value
function hexToSignedInt(hex:string):number 
{
  if (hex.length % 2 != 0) {
      hex = "0" + hex;
  }
  var num = parseInt(hex, 16);
  var maxVal = Math.pow(2, hex.length / 2 * 8);
  if (num > maxVal / 2 - 1) {
      num = num - maxVal
  }
  return num;
}

// based: https://stackoverflow.com/questions/57803/how-to-convert-decimal-to-hexadecimal-in-javascript
function int8ToHexString(number:number):string
{
  if (number < 0)
  {
    number = 0xFF + number + 1;
  }
  return number.toString(16).padStart(2, "0");
}

function int16ToHexString(number:number):string
{
  if (number < 0)
  {
    number = 0xFFFF + number + 1;
  }
  return number.toString(16).padStart(4, "0");
}

function int32ToHexString(number:number):string
{
  if (number < 0)
  {
    number = 0xFFFFFFFF + number + 1;
  }
  return number.toString(16).padStart(8, "0");
}

export class EchoNetPropertyConverter
{
  echoNetDefinitionRepository:EchoNetDefinitionRepository = new EchoNetDefinitionRepository();

  public getDevice(eojClass:string):ElDeviceDescription | undefined
  {
    const definitions = this.echoNetDefinitionRepository.getDefinition();
    let device = this.echoNetDefinitionRepository.getClass(eojClass);

    if(device === undefined)
    {
      return undefined;
    }

    for(const prop of device.elProperties)
    {
      prop.data = this.convertFromRefType(prop.data, definitions);
    }
    return device;
  }

  private convertFromRefType(schema:ElDataType, definitions:ElDefinitions)
  {
    if("$ref" in schema)
    {
      const refName = schema["$ref"].replace("#/definitions/", "");
      if(refName in definitions.definitions)
      {
        const toType = definitions.definitions[refName];
        return toType;
      }
      throw new Error(`存在しない$refです:${refName}`);
    }
    
    if("oneOf" in schema)
    {
      const newSchema = JSON.parse(JSON.stringify(schema)) as ElMixedOneOfType;
      for(let i = 0; i < schema.oneOf.length; i++)
      {
        newSchema.oneOf[i] = this.convertFromRefType(schema.oneOf[i],definitions);
      }
      return newSchema;
    }
    
    if(schema.type === "array")
    {
      const newSchema = JSON.parse(JSON.stringify(schema)) as ElArrayType;
      newSchema.items = this.convertFromRefType(schema.items, definitions);
      return newSchema;
    }
    if(schema.type === "bitmap")
    {
      const newSchema = JSON.parse(JSON.stringify(schema)) as ElBitmapType;
      for(const prop of newSchema.bitmaps)
      {
        prop.value = this.convertFromRefType(prop.value, definitions);
      }
      return newSchema;
    }

    if(schema.type === "object")
    {
      const newSchema = JSON.parse(JSON.stringify(schema)) as ElObjectType;
      for(const prop of newSchema.properties)
      {
        prop.element = this.convertFromRefType(prop.element, definitions);
      }
      return newSchema;
    }
    return schema;
  }


  public createDummyDevice(eoj:string):ElDeviceDescription
  {
    const definitions = this.echoNetDefinitionRepository.getDefinition();
    const superClass = this.echoNetDefinitionRepository.getSuperClass();

    let eojNo = eoj.toUpperCase();
    eojNo = eojNo.startsWith("0X") ? eojNo.substring(2) : eojNo;
    const className = "Unknown_" + eojNo;
    const device:ElDeviceDescription = {
      className: {ja:`不明なクラス EOJ:${eojNo}`, en:`Unknwon class EOJ:${eojNo}`},
      elProperties: JSON.parse(JSON.stringify(superClass.elProperties)),
      eoj: `0x${eojNo}`,
      shortName: className,
      validRelease: {from:"A", to:"latest"}
    }

    for(const prop of device.elProperties)
    {
      prop.data = this.convertFromRefType(prop.data, definitions);
    }
    return device;
  }

  public createDummyProperty(epcNo:string):ElPropertyDescription
  {
    const propertyName = `unknown_${epcNo}`;

    return {
      data:{
        type:"raw",
        minSize:0,
        maxSize:255
      },
      descriptions:{ja: `不明なプロパティ EPC:${epcNo}`,en: `Unknown property EPC:${epcNo}`},
      epc:`0x${epcNo}`,
      shortName: propertyName,
      accessRule:{
        get:"optional",
        set:"optional",
        inf:"optional"
      },
      note:{ja:"",en:""},
      propertyName: {ja: `不明なプロパティ EPC:${epcNo}`,en: `Unknown property EPC:${epcNo}`},
      validRelease: {from:"A", to:"latest"},
      remark:{ja:"",en:""}
    }
  }

  public toEchoNetLiteData(dataType:ElDataType, value:any):string|undefined
  {
    if("type" in dataType)
    {
      switch(dataType.type)
      {
        case "array":
          return this.ArrayToEchoNetLiteData(dataType, value);
        case "bitmap":
          return this.BitmapToEchoNetLiteData(dataType, value);
        case "date":
          return this.DateToEchoNetLiteData(dataType, value);
        case "date-time":
          return this.DateTimeToEchoNetLiteData(dataType, value);
        case "level":
          return this.LevelToEchoNetLiteData(dataType, value);
        case "number":
          return this.NumberToEchoNetLiteData(dataType, value);
        case "numericValue":
          return this.NumericValueToEchoNetLiteData(dataType, value);
        case "object":
          return this.ObjectToEchoNetLiteData(dataType, value);
        case "raw":
          return this.RawToEchoNetLiteData(dataType, value);
        case "state":
          return this.StateToEchoNetLiteData(dataType, value);
        case "time":
          return this.TimeToEchoNetLiteData(dataType, value);
        default:
          throw Error("Unexpected");
      }
    }
    else if("$ref" in dataType)
    {
      throw Error("Unexpected");
    }
    else if("oneOf" in dataType)
    {
      const typePrioerties = ["numericValue",
        "state",
        "level",
        "number",
        "date-time",
        "date",
        "time",
        "array",
        "bitmap",
        "object",
        "raw"];

      for(let type of typePrioerties)
      {
        const selectedType = dataType.oneOf.filter(_=>"type" in _ && _.type == type);
        for(let itemType of selectedType)
        {
          const result = this.toEchoNetLiteData(itemType, value);
          if(result !== undefined)
          {
            return result;
          }
        }
      }

    }    
    return undefined;
  }

  private DateTimeToEchoNetLiteData(dataType:ElDateTimeType, value:any):string|undefined
  {
    if(typeof(value) !== "string")
    {
      return undefined;
    }
    const valueText = value.toString();
    const size = dataType?.size ?? 7;

    let year = 1900;
    let month = 1;
    let day = 1;
    let hour = 0;
    let minute = 0;
    let second = 0;
    if(size === 7 && valueText.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}$/)!==null)
    {
      year  = parseInt(valueText.substring(0,4), 10);
      month = parseInt(valueText.substring(5,7), 10);
      day   = parseInt(valueText.substring(8,10), 10);
      hour  = parseInt(valueText.substring(11,13), 10);
      minute= parseInt(valueText.substring(14,16), 10);
      second= parseInt(valueText.substring(17,19), 10);
    }
    else if(size === 6 && valueText.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}$/)!==null)
    {
      year  = parseInt(valueText.substring(0,4), 10);
      month = parseInt(valueText.substring(5,7), 10);
      day   = parseInt(valueText.substring(8,10), 10);
      hour  = parseInt(valueText.substring(11,13), 10);
      minute= parseInt(valueText.substring(14,16), 10);
    }
    else if(size === 5 && valueText.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}$/)!==null)
    {
      year  = parseInt(valueText.substring(0,4), 10);
      month = parseInt(valueText.substring(5,7), 10);
      day   = parseInt(valueText.substring(8,10), 10);
      hour  = parseInt(valueText.substring(11,13), 10);
    }
    else
    {
      return undefined;
    }

    
    if(month>12)
    {
      return undefined;
    }
    if(day > 31)
    {
      return undefined;
    }
    if(day > 30 && (month == 4 || month == 6 || month == 9 || month == 11))
    {
      return undefined;
    }
    if(day > 29 && month == 2)
    {
      return undefined;
    }
    if(hour > 23)
    {
      return undefined;
    }
    if(minute > 59)
    {
      return undefined;
    }
    if(second > 59)
    {
      return undefined;
    }

    const yearText = year.toString(16).padStart(4, "0");
    const monthText = month.toString(16).padStart(2, "0");
    const dayText = day.toString(16).padStart(2, "0");
    const hourText = hour.toString(16).padStart(2, "0");
    const minuteText = minute.toString(16).padStart(2, "0");
    const secondText = second.toString(16).padStart(2, "0");

    if(size === 7)
    {
      return `${yearText}${monthText}${dayText}${hourText}${minuteText}${secondText}`;
    }
    if(size === 6)
    {
      return `${yearText}${monthText}${dayText}${hourText}${minuteText}`;
    }
    if(size === 5)
    {
      return `${yearText}${monthText}${dayText}${hourText}`;
    }

    return undefined;
  }
  
  private DateToEchoNetLiteData(schema:ElDateType, value:any):string|undefined
  {
    const valueText = value.toString() as string;

    const size = schema?.size ?? 4;

    let year = 1900;
    let month = 1;
    let day = 1;
    if(size == 4 && valueText.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/)!==null)
    {
      year  = parseInt(valueText.substring(0,4), 10);
      month = parseInt(valueText.substring(5,7), 10);
      day   = parseInt(valueText.substring(8,10), 10);
      return year.toString(16).padStart(4, "0") + month.toString(16).padStart(2, "0") + 
        day.toString(16).padStart(2, "0");
    }
    else if(size == 3 && valueText.match(/^[0-9]{4}-[0-9]{2}$/)!==null)
    {
      year  = parseInt(valueText.substring(0,4), 10);
      month = parseInt(valueText.substring(5,7), 10);
      return year.toString(16).padStart(4, "0") + month.toString(16).padStart(2, "0");
    }
    else if(size == 2 && valueText.match(/^[0-9]{4}$/)!==null)
    {
      year  = parseInt(valueText.substring(0,4), 10);
      return year.toString(16).padStart(4, "0");
    }
    else
    {
      return undefined;
    }
  }
  
  private TimeToEchoNetLiteData(schema:ElTimeType, value:any):string|undefined
  {
    if(typeof(value) !== "string")
    {
      return undefined;
    }
    const valueText = value.toString();

    const size = schema?.size ?? 3;

    let hour = 0;
    let minute = 0;
    let second = 0;
    if(size === 3 && valueText.match(/^[0-9]{2}:[0-9]{2}:[0-9]{2}$/)!==null)
    {
      hour  = parseInt(valueText.substring(0,2), 10);
      minute= parseInt(valueText.substring(3,5), 10);
      second= parseInt(valueText.substring(6,8), 10);
    }
    else if(size === 2 && valueText.match(/^[0-9]{2}:[0-9]{2}$/)!==null)
    {
      hour  = parseInt(valueText.substring(0,2), 10);
      minute= parseInt(valueText.substring(3,5), 10);
    }
    else if(size === 1 && valueText.match(/^[0-9]{2}$/)!==null)
    {
      hour  = parseInt(valueText.substring(0,2), 10);
    }
    else
    {
      return undefined;
    }

    if(hour >= 24)
    {
      return undefined;
    }
    if(minute >= 60)
    {
      return undefined;
    }
    if(second >= 60)
    {
      return undefined;
    }

    let result = "";
    if(size >= 1)
    {
      result += hour.toString(16).padStart(2, "0");
    }
    if(size >= 2)
    {
      result += minute.toString(16).padStart(2, "0");
    }
    if(size >= 3)
    {
      result += second.toString(16).padStart(2, "0");
    }
    return result;
  }

  private NumberToEchoNetLiteData(schema:ElNumberType, value:any):string|undefined
  {
    if((schema.underflowCode ?? true) && value === "underflow")
    {
      if(schema.format === "int8") { return "80"; }
      if(schema.format === "int16") { return "8000"; }
      if(schema.format === "int32") { return "80000000"; }
      if(schema.format === "uint8") { return "fe"; }
      if(schema.format === "uint16") { return "fffe"; }
      if(schema.format === "uint32") { return "fffffffe"; }
      return undefined;
    }
    if((schema.overflowCode ?? true) && value === "overflow")
    {
      if(schema.format === "int8") { return "7f"; }
      if(schema.format === "int16") { return "7fff"; }
      if(schema.format === "int32") { return "7fffffff"; }
      if(schema.format === "uint8") { return "ff"; }
      if(schema.format === "uint16") { return "ffff"; }
      if(schema.format === "uint32") { return "ffffffff"; }
      return undefined;
    }

    if(typeof(value) !== "number")
    {
      return undefined;
    }

    if(schema.enum !== undefined)
    {
      if(schema.enum.indexOf(value)===-1)
      {
        return undefined;
      }
    }

    let value2 = value;
    if(schema.multiple !== undefined)
    {
      value2 = value / schema.multiple;
    }
    else if(schema.multipleOf !== undefined)
    {
      // multipleOfは本来ステップ幅。だとすれば無視すればよいが、どうもmultipleと混同して使われている気がするので
      // multipleが無かった場合は、これをmultiple代わりにする
      value2 = value / schema.multipleOf;
    }

    if(schema.minimum !== undefined && value2 < schema.minimum)
    {
      return undefined;
    }
    if(schema.maximum !== undefined && value2 > schema.maximum)
    {
      return undefined;
    }

    switch(schema.format)
    {
      case "int8":
        return int8ToHexString(value2);
      case "int16":
        return int16ToHexString(value2);
      case "int32":
        return int32ToHexString(value2);
      case "uint8":
        return (value2).toString(16).substr(0,2).padStart(2, "0");
      case "uint16":
        return (value2).toString(16).substr(0,4).padStart(4, "0");
      case "uint32":
        return (value2).toString(16).substr(0,8).padStart(8, "0");
    }
  }

  private StateToEchoNetLiteData(schema:ElStateType, value:any):string|undefined
  {
    if(typeof(value) !== "string")
    {
      return undefined;
    }
    const valueText = value.toString();
    const matchEnum = schema.enum.find(_=>_.name === valueText);
    if(matchEnum === undefined)
    {
      return undefined;
    }
    return matchEnum.edt.substring(2).toLocaleLowerCase();  // remove "0x" and lower
  }

  private NumericValueToEchoNetLiteData(schema:ElNumericValueType, value:any):string|undefined
  {
    if(typeof(value) !== "number")
    {
      return undefined;
    }
    const matchEnum = schema.enum.find(_=>_.numericValue === value);
    if(matchEnum === undefined)
    {
      return undefined;
    }
    return matchEnum.edt.substring(2).toLocaleLowerCase();  // remove "0x" and lower
  }

  private LevelToEchoNetLiteData(schema:ElLevelType, value:any):string|undefined
  {
    if(typeof(value) !== "number")
    {
      return undefined;
    }
    if(value < 1 || schema.maximum < value)
    {
      return undefined;
    }
    const baseNum = parseInt(schema.base.substr(2),16);
    const retunValueNum = baseNum + value - 1;
    return retunValueNum.toString(16);
  }

  
  private ArrayToEchoNetLiteData(schema:ElArrayType, value:any):string|undefined
  {
    if(Array.isArray(value) === false)
    {
      return undefined;
    }
    let result = "";
    for(const item of value)
    {
      let itemText = this.toEchoNetLiteData(schema.items, item);
      if(itemText === undefined)
      {
        return undefined;
      }
      while(itemText.length < schema.itemSize * 2)
      {
        itemText = "0" + itemText;
      }
      result += itemText;
    }
    return result;
  }

  private ObjectToEchoNetLiteData(schema:ElObjectType, value:any):string|undefined
  {
    if(typeof(value) !== "object")
    {
      return undefined;
    }

    let result = "";

    for(const prop of schema.properties)
    {
      if((prop.shortName in value) === false)
      {
        return undefined;
      }
      const val = value[prop.shortName];
      const itemText = this.toEchoNetLiteData(prop.element, val);
      if(itemText === undefined)
      {
        return undefined;
      }
      result += itemText;
    }
    return result;
  }

  private BitmapToEchoNetLiteData(schema:ElBitmapType, value:any):string|undefined
  {
    if(typeof(value) !== "object")
    {
      return undefined;
    }

    let result:number[] = new Array(schema.size).fill(0x00);

    for(const prop of schema.bitmaps)
    {
      if((prop.name in value) === false)
      {
        return undefined;
      }

      const val = value[prop.name];
      const itemHexText = this.toEchoNetLiteData(prop.value, val);
      if(itemHexText === undefined)
      {
        return undefined;
      }
      let itemHexTextNum = parseInt(itemHexText, 16);

      for(let i = 0; i<8;i++)
      {
        if(prop.position.bitMask.substr(prop.position.bitMask.length - 1 - i, 1) === "1")
        {
          result[prop.position.index] += (itemHexTextNum % 2) << i;
          itemHexTextNum = itemHexTextNum >> 1;
        }
      }
    }
    return result.map(_=>_.toString(16).padStart(2,"0")).join("");
  }

  private RawToEchoNetLiteData(schema:ElRawType, value:any):string|undefined
  {
    if(typeof(value) !== "string")
    {
      return undefined;
    }
    if(value.length / 2 < schema.minSize || schema.maxSize < value.length / 2)
    {
      return undefined;
    }

    return value;
  }


  public toObject(dataType:ElDataType, value:string):unknown|undefined{
    if("type" in dataType)
    {
      switch(dataType.type)
      {
        case "array":
          return this.EchoNetLiteDataToArray(dataType, value);
        case "bitmap":
          return this.EchoNetLiteDataToBitmap(dataType, value);
        case "date":
          return this.EchoNetLiteDataToDate(dataType, value);
        case "date-time":
          return this.EchoNetLiteDataToDateTime(dataType, value);
        case "level":
          return this.EchoNetLiteDataToLevel(dataType, value);
        case "number":
          return this.EchoNetLiteDataToNumber(dataType, value);
        case "numericValue":
          return this.EchoNetLiteDataToNumericValue(dataType, value);
        case "object":
          return this.EchoNetLiteDataToObject(dataType, value);
        case "raw":
          return this.EchoNetLiteDataToRaw(dataType, value);
        case "state":
          return this.EchoNetLiteDataToState(dataType, value);
        case "time":
          return this.EchoNetLiteDataToTime(dataType, value);
        default:
          throw Error("Unexpected");
      }
    }
    else if("$ref" in dataType)
    {
      throw Error("Unexpected");
    }
    else if("oneOf" in dataType)
    {
      const typePrioerties = ["numericValue",
        "state",
        "level",
        "number",
        "date-time",
        "date",
        "time",
        "array",
        "bitmap",
        "object",
        "raw"];

      for(const type of typePrioerties)
      {
        const selectedItems = dataType.oneOf.filter(_=>"type" in _ && _.type === type);

        for(let itemType of selectedItems)
        {
          const result = this.toObject(itemType, value);
          if(result !== undefined)
          {
            return result;
          }
        }
      }
    }
    return undefined;
  }

  private EchoNetLiteDataToDateTime(dataType:ElDateTimeType, value:string):string|undefined{
    const size = dataType.size ?? 7
    if(value.length != size * 2)
    {
      return undefined;
    }


    
    let minutes = 0;
    let seconds = 0;
    if(size === 7)
    {
      minutes = value.length >=12 ? parseInt( value.substr(10, 2), 16) : -1;
      seconds = value.length >=14 ? parseInt( value.substr(12, 2), 16) : -1;
    }
    else if(size === 6)
    {
      minutes = value.length >=12 ? parseInt( value.substr(10, 2), 16) : -1;
    }
    else if(size === 5)
    {
      // none
    }
    else
    {
      return undefined;
    }

    const year = parseInt( value.substr(0, 4), 16);
    const month = parseInt( value.substr(4, 2), 16);
    const day = parseInt( value.substr(6, 2), 16);
    const hours = parseInt( value.substr(8, 2), 16);

    if(month>12)
    {
      return undefined;
    }
    if(day > 31)
    {
      return undefined;
    }
    if(day > 30 && (month == 4 || month == 6 || month == 9 || month == 11))
    {
      return undefined;
    }
    if(day > 29 && month == 2)
    {
      return undefined;
    }
    if(hours > 23)
    {
      return undefined;
    }
    if(minutes > 59)
    {
      return undefined;
    }
    if(seconds > 59)
    {
      return undefined;
    }
    
    const yearText = year.toString().padStart(4, "0");
    const monthText = month.toString().padStart(2, "0");
    const dayText = day.toString().padStart(2, "0");
    const hoursText = hours.toString().padStart(2, "0");
    const minutesText = minutes.toString().padStart(2, "0");
    const secondsText = seconds.toString().padStart(2, "0");
    
    if(size === 7)
    {
      return `${yearText}-${monthText}-${dayText} ${hoursText}:${minutesText}:${secondsText}`;
    }
    if(size === 6)
    {
      return `${yearText}-${monthText}-${dayText} ${hoursText}:${minutesText}`;
    }
    if(size === 5)
    {
      return `${yearText}-${monthText}-${dayText} ${hoursText}`;
    }
    return undefined;
  }
  private EchoNetLiteDataToDate(schema:ElDateType, value:string):string|undefined{
    const size = schema.size ?? 7
    if(value.length != size * 2)
    {
      return undefined;
    }

    const year = parseInt( value.substr(0, 4), 16);
    const month = value.length >=6 ?parseInt( value.substr(4, 2), 16) : -1;
    const day = value.length >=8 ? parseInt( value.substr(6, 2), 16) : -1;
    const yearText = year.toString().padStart(4, "0");
    const monthText = month.toString().padStart(2, "0");
    const dayText = day.toString().padStart(2, "0");

    if(month>12)
    {
      return undefined;
    }
    if(day > 31)
    {
      return undefined;
    }
    if(day > 30 && (month == 4 || month == 6 || month == 9 || month == 11))
    {
      return undefined;
    }
    if(day > 29 && month == 2)
    {
      return undefined;
    }
    
    if(month === -1)
    {
      return `${yearText}`;
    }
    if(day === -1)
    {
      return `${yearText}-${monthText}`;
    }
    return `${yearText}-${monthText}-${dayText}`;
  }
  private EchoNetLiteDataToTime(schema:ElTimeType, value:string):string|undefined{
    const size = schema.size ?? 7
    if(value.length != size * 2)
    {
      return undefined;
    }

    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    if(size === 3)
    {
      hours = parseInt( value.substr(0, 2), 16);
      minutes = parseInt( value.substr(2, 2), 16);
      seconds = parseInt( value.substr(4, 2), 16);
    }
    else if(size === 2)
    {
      hours = parseInt( value.substr(0, 2), 16);
      minutes = parseInt( value.substr(2, 2), 16);
    }
    else if(size === 1)
    {
      hours = parseInt( value.substr(0, 2), 16);
    }
    else 
    {
      return undefined;
    }
 
    if(hours >= 24)
    {
      return undefined;
    }
    if(minutes >= 60)
    {
      return undefined;
    }
    if(seconds >= 60)
    {
      return undefined;
    }

    const hoursText = hours.toString().padStart(2, "0");
    const minutesText = minutes.toString().padStart(2, "0");
    const secondsText = seconds.toString().padStart(2, "0");
    if(size == 3)
    {
      return `${hoursText}:${minutesText}:${secondsText}`;
    }
    if(size == 2)
    {
      return `${hoursText}:${minutesText}`;
    }
    if(size == 1)
    {
      return `${hoursText}`;
    }
    return undefined;
  }

  

  private EchoNetLiteDataToNumber(schema:ElNumberType, value:string):number|undefined|"underflow"|"overflow"
  {
    let returnValue = 0;
    switch(schema.format)
    {
      case "int8":
      case "uint8":
        if(value.length!==2)
        {
          return undefined;
        }
        break;
      case "int16":
      case "uint16":
        if(value.length!==4)
        {
          return undefined;
        }
        break;
      case "int32":
      case "uint32":
        if(value.length!==8)
        {
          return undefined;
        }
        break;
    }

    if(schema.underflowCode ?? true)
    {
      if(schema.format === "int8" && value === "80") { return "underflow"; }
      if(schema.format === "int16" && value === "8000") { return "underflow"; }
      if(schema.format === "int32" && value === "80000000") { return "underflow"; }
      if(schema.format === "uint8" && value === "fe") { return "underflow"; }
      if(schema.format === "uint16" && value === "fffe") { return "underflow"; }
      if(schema.format === "uint32" && value === "fffffffe") { return "underflow"; }
    }
    if(schema.overflowCode ?? true)
    {
      if(schema.format === "int8" && value === "7f") { return "overflow"; }
      if(schema.format === "int16" && value === "7fff") { return "overflow"; }
      if(schema.format === "int32" && value === "7fffffff") { return "overflow"; }
      if(schema.format === "uint8" && value === "ff") { return "overflow"; }
      if(schema.format === "uint16" && value === "ffff") { return "overflow"; }
      if(schema.format === "uint32" && value === "ffffffff") { return "overflow"; }
    }

    switch(schema.format)
    {
      case "int8":
        returnValue = hexToSignedInt(value.substr(0, 2));
        break;
      case "int16":
        returnValue = hexToSignedInt(value.substr(0, 4));
        break;
      case "int32":
        returnValue = hexToSignedInt(value.substr(0, 8));
        break;
      case "uint8":
        returnValue = parseInt(value.substr(0, 2), 16);
        break;
      case "uint16":
        returnValue = parseInt(value.substr(0, 4), 16);
        break;
      case "uint32":
        returnValue = parseInt(value.substr(0, 8), 16);
        break;
    }
    if(schema.maximum !== undefined && schema.maximum < returnValue)
    {
      return undefined;
    }
    if(schema.minimum !== undefined && schema.minimum > returnValue)
    {
      return undefined;
    }

    if(schema.multiple !== undefined)
    {
      returnValue = returnValue * schema.multiple;
    }
    else if(schema.multipleOf !== undefined)
    {
      // multipleOfは本来ステップ幅。だとすれば無視すればよいが、どうもmultipleと混同して使われている気がするので
      // multipleが無かった場合は、これをmultiple代わりにする
      returnValue = returnValue * schema.multipleOf;
    }

    if(schema.enum !== undefined)
    {
      if(schema.enum.indexOf(returnValue)===-1)
      {
        return undefined;
      }
    }
    return returnValue;
  }

  private EchoNetLiteDataToState(schema:ElStateType, value:string):string|undefined
  {
    const matchedEnum = schema.enum.find(_=>_.edt.substr(2).toLocaleLowerCase() === value);
    return matchedEnum?.name;
  }
  
  private EchoNetLiteDataToNumericValue(schema:ElNumericValueType, value:string):number|undefined
  {
    const matchedEnum = schema.enum.find(_=>_.edt.substr(2).toLocaleLowerCase() === value);
    if(matchedEnum === undefined)
    {
      return undefined;
    }
    return matchedEnum.numericValue;
  }
  
  private EchoNetLiteDataToLevel(schema:ElLevelType, value:string):number|undefined
  {
    const base = parseInt(schema.base.substr(2));
    const cur = parseInt(value);
    const result =  cur - base + 1;
    if(1 <= result && result <= schema.maximum)
    {
      return result;
    }
    return undefined;
  }

  private EchoNetLiteDataToArray(schema:ElArrayType, value:string):unknown[]|undefined
  {
    const arr:unknown[] = [];
    const hexItemLength = schema.itemSize * 2
    for(let i = 0; i < value.length; i+=hexItemLength)
    {
      const hexItem = value.substr(i, hexItemLength);
      let itemValueText = this.toObject(schema.items, hexItem);
      arr.push(itemValueText);
    }
    return arr;
  }

  private EchoNetLiteDataToObject(schema:ElObjectType, value:string):object|undefined
  {
    const returnValue:{[key:string]:unknown} = {};

    let currentPointer = 0;
    for(const prop of schema.properties)
    {
      const size = this.getByteSizeFromSchema(prop.element);
      const val = this.toObject(prop.element, value.substr(currentPointer, size*2));
      currentPointer += size * 2;
      returnValue[prop.shortName] = val;
    }
    return returnValue;
  }

  private EchoNetLiteDataToBitmap(schema:ElBitmapType, value:string):object|undefined
  {
    const returnValue:{[key:string]:unknown} = {};

    for(const prop of schema.bitmaps)
    {
      const itemHexValue = value.substr(prop.position.index * 2, 2);
      let itemNumValue = parseInt(itemHexValue, 16);
      
      let convertedValue = 0;
      let shift = 0;
      for(let i = 0; i < 8; i++)
      {
        // bitmask format 0b00000000
        if(prop.position.bitMask.substr(prop.position.bitMask.length-1-i,1) === "1")
        {
          convertedValue += ((itemNumValue >> i) % 2) << shift;
          shift++;
        }
      }
      const itemHexValue2 = convertedValue.toString(16).padStart(2, "0");

      const itemValue = this.toObject(prop.value, itemHexValue2);
      returnValue[prop.name] = itemValue;
    }
    return returnValue;
  }

  private EchoNetLiteDataToRaw(schema:ElRawType, value:string):string|undefined
  {
    if(value.length / 2 < schema.minSize || schema.maxSize < value.length / 2)
    {
      return undefined;
    }
    return value;
  }

  
  private getByteSizeFromSchema(schema: ElDataType):number
  {
    if("type" in schema)
    {
      switch(schema.type)
      {
        case "array":
          return schema.itemSize * schema.maxItems;
        case "bitmap":
          return schema.size;
        case "date":
          return schema.size ?? 4;
        case "date-time":
          return schema.size ?? 7;
        case "level":
          return 1;
        case "number":
          switch(schema.format)
          {
            case "int8":
            case "uint8":
              return 1;
            case "int16":
            case "uint16":
              return 2;
            case "int32":
            case "uint32":
              return 4;
          }
          return 0;
        case "numericValue":
          return 1;
        case "object":
          return schema.properties.map(_=>this.getByteSizeFromSchema(_.element)).reduce((pre:number, cur:number)=>pre+cur);
        case "raw":
          return schema.minSize;
        case "state":
          return schema.size;
        case "time":
          return schema.size ?? 3;
        default:
          throw Error("Unexpected");
      }
    }
    else if("oneOf" in schema)
    {
      const firstSize = this.getByteSizeFromSchema(schema.oneOf[0]);
      for(let itemType of schema.oneOf)
      {
        const result = this.getByteSizeFromSchema(itemType);
        if(result !== firstSize)
        {
          return 0;
        }
      }
      return firstSize;
    }
    return 0;
  }
  
  public getManufacturer(raw:string):Manufacturer
  {
    const code = "0x" + raw.toUpperCase();
    const manufacturer = manufacturers.find(_=>_.code === code);
    if(manufacturer === undefined)
    {
      return {"code":code, "descriptions":{"en":"Unknown", "ja":"Unknown"}};
    }
    return manufacturer;
  }

  public getProtocol(raw:string): Protocol
  {
    // 8桁のHEXのうち4桁目から2文字をHEXとして解釈して対応するアスキーにする
    const release = String.fromCharCode(parseInt(raw.substr(4,2), 16));
    
    // 8桁のHEXのうち6桁目から2文字をHEXとして数値にする
    const revision = parseInt(raw.substr(6,2), 16);
    if(revision === 0)
    {
      return {"type":"ECHONET_Lite v1.14", "version":`Rel.${release}`};
    }

    return {"type":"ECHONET_Lite v1.14", "version":`Rel.${release} Rev.${revision}`};
  }
}


const manufacturers:Manufacturer[]=[
  {"code":"0x000001","descriptions":{"en":"Hitachi, Ltd.","ja":"株式会社日立製作所"}},
  {"code":"0x000005","descriptions":{"en":"Sharp Corp","ja":"シャープ株式会社"}},
  {"code":"0x000006","descriptions":{"en":"Mitsubishi Electric Corp.","ja":"三菱電機株式会社"}},
  {"code":"0x000008","descriptions":{"en":"DAIKIN INDUSTRIES,LTD.","ja":"ダイキン工業株式会社"}},
  {"code":"0x000009","descriptions":{"en":"NEC Corp.","ja":"日本電気株式会社"}},
  {"code":"0x00000B","descriptions":{"en":"Panasonic Holdings Corporation","ja":"パナソニック ホールディングス株式会社"}},
  {"code":"0x000012","descriptions":{"en":"Oi Electric Co., Ltd","ja":"大井電気株式会社"}},
  {"code":"0x000015","descriptions":{"en":"Daikin Systems&Solutions Laboratory Ltd.","ja":"株式会社ダイキンシステムソリューションズ研究所"}},
  {"code":"0x000016","descriptions":{"en":"Toshiba Corp.","ja":"株式会社東芝"}},
  {"code":"0x000017","descriptions":{"en":"Carrier Japan Corporation","ja":"日本キヤリア株式会社"}},
  {"code":"0x00001B","descriptions":{"en":"TOSHIBA LIGHTING & TECHNOLOGY CORPORATION","ja":"東芝ライテック株式会社"}},
  {"code":"0x000022","descriptions":{"en":"Hitachi Global Life Solutions, Inc.","ja":"日立グローバルライフソリューションズ株式会社"}},
  {"code":"0x000023","descriptions":{"en":"NTT COMWARE CORPORATION","ja":"エヌ・ティ・ティ・コムウェア株式会社"}},
  {"code":"0x000025","descriptions":{"en":"LIXIL Corporation","ja":"株式会社LIXIL"}},
  {"code":"0x00002C","descriptions":{"en":"AFT CO.,LTD","ja":"株式会社AFT"}},
  {"code":"0x00002E","descriptions":{"en":"SHIKOKU INSTRUMENTATION CO.,LTD","ja":"四国計測工業株式会社"}},
  {"code":"0x00002F","descriptions":{"en":"AIPHONE CO., LTD.","ja":"アイホン株式会社"}},
  {"code":"0x000034","descriptions":{"en":"MITSUBISHI ELECTRIC ENGINEERING COMPANY LIMITED","ja":"三菱電機エンジニアリング株式会社"}},
  {"code":"0x000035","descriptions":{"en":"Toshiba Toko Meter Systems Co.,Ltd.","ja":"東光東芝メーターシステムズ株式会社"}},
  {"code":"0x000036","descriptions":{"en":"NISSIN SYSTEMS CO., LTD.","ja":"株式会社日新システムズ"}},
  {"code":"0x00003A","descriptions":{"en":"SEKISUI HOUSE, LTD.","ja":"積水ハウス株式会社"}},
  {"code":"0x00003B","descriptions":{"en":"KYOCERA Corporation","ja":"京セラ株式会社"}},
  {"code":"0x00003C","descriptions":{"en":"DENSO Corporation","ja":"株式会社デンソー ( https://www.denso.com/jp/ja/ )"}},
  {"code":"0x00003D","descriptions":{"en":"SUMITOMO ELECTRIC INDUSTRIES, LTD.","ja":"住友電気工業株式会社"}},
  {"code":"0x00003E","descriptions":{"en":"SUMITOMO ELECTRIC NETWORKS, INC.","ja":"住友電工ネットワークス株式会社"}},
  {"code":"0x000040","descriptions":{"en":"Hitachi High-Tech Solutions Corporation","ja":"株式会社日立ハイテクソリューションズ"}},
  {"code":"0x000041","descriptions":{"en":"ENEGATE CO.,LTD.","ja":"株式会社エネゲート"}},
  {"code":"0x000043","descriptions":{"en":"TOSHIBA DEVELOPMENT & ENGINEERING CORPORATION","ja":"東芝デベロップメントエンジニアリング㈱"}},
  {"code":"0x000044","descriptions":{"en":"Hitachi Industrial Equipment Systems Co.,Ltd.","ja":"株式会社日立産機システム"}},
  {"code":"0x000047","descriptions":{"en":"NIPPON TELEGRAPH AND TELEPHONE EAST CORPORATION","ja":"東日本電信電話株式会社"}},
  {"code":"0x000048","descriptions":{"en":"Oki Electric Industry Co., Ltd.","ja":"沖電気工業株式会社"}},
  {"code":"0x00004D","descriptions":{"en":"INABA DENKI SANGYO CO.,LTD.","ja":"因幡電機産業株式会社"}},
  {"code":"0x00004E","descriptions":{"en":"FUJITSU LIMITED","ja":"富士通株式会社"}},
  {"code":"0x00004F","descriptions":{"en":"Daiwa House Industry co.,Ltd","ja":"大和ハウス工業株式会社"}},
  {"code":"0x000050","descriptions":{"en":"TOTO LTD.","ja":"ＴＯＴＯ株式会社"}},
  {"code":"0x000051","descriptions":{"en":"Fuji IT Co.,Ltd.","ja":"富士アイティ株式会社"}},
  {"code":"0x000052","descriptions":{"en":"OSAKI ELECTRIC CO.,LTD.","ja":"大崎電気工業株式会社"}},
  {"code":"0x000053","descriptions":{"en":"Ubiquitous AI Corporation","ja":"株式会社ユビキタスAI"}},
  {"code":"0x000054","descriptions":{"en":"NORITZ CORP.","ja":"株式会社ノーリツ"}},
  {"code":"0x000055","descriptions":{"en":"FAMILYNET JAPAN CORPORATION","ja":"株式会社ファミリーネット・ジャパン"}},
  {"code":"0x000056","descriptions":{"en":"iND Co.,Ltd","ja":"株式会社iND"}},
  {"code":"0x000057","descriptions":{"en":"ELIIYPower Co.,ltd","ja":"エリーパワー株式会社"}},
  {"code":"0x000058","descriptions":{"en":"Mediotec Corporation","ja":"株式会社メディオテック"}},
  {"code":"0x000059","descriptions":{"en":"Rinnai Corporation","ja":"リンナイ株式会社"}},
  {"code":"0x00005C","descriptions":{"en":"Tranceboot Co.,Ltd.","ja":"トランスブート株式会社"}},
  {"code":"0x000060","descriptions":{"en":"Sony Computer Science Laboratories, Inc.","ja":"株式会社ソニーコンピュータサイエンス研究所"}},
  {"code":"0x000061","descriptions":{"en":"NTT DATA INTELLILINK CORPORATION","ja":"エヌ・ティ・ティ・データ先端技術株式会社"}},
  {"code":"0x000063","descriptions":{"en":"Kawamura Electric Inc.","ja":"河村電器産業株式会社"}},
  {"code":"0x000064","descriptions":{"en":"OMRON SOCIAL SOLUTIONS CO.,LTD.","ja":"オムロン ソーシアルソリューションズ株式会社"}},
  {"code":"0x000067","descriptions":{"en":"CORONA CORPORATION","ja":"株式会社コロナ"}},
  {"code":"0x000068","descriptions":{"en":"AISIN CORPORATION","ja":"株式会社アイシン"}},
  {"code":"0x000069","descriptions":{"en":"Toshiba Lifestyle Products & Services Corporation","ja":"東芝ライフスタイル株式会社"}},
  {"code":"0x00006A","descriptions":{"en":"OKAYA & CO., LTD.","ja":"岡谷鋼機株式会社"}},
  {"code":"0x00006B","descriptions":{"en":"ISB Corporation","ja":"株式会社アイ・エス・ビー"}},
  {"code":"0x00006C","descriptions":{"en":"NICHICON CORPORATION","ja":"ニチコン株式会社"}},
  {"code":"0x00006E","descriptions":{"en":"Soundvision co.,ltd.","ja":"株式会社サウンドビジョン"}},
  {"code":"0x00006F","descriptions":{"en":"BUFFALO INC.","ja":"株式会社バッファロー"}},
  {"code":"0x000071","descriptions":{"en":"NIHON SANGYO CO.,LTD.","ja":"株式会社日本産業"}},
  {"code":"0x000072","descriptions":{"en":"Eneres Co.,Ltd.","ja":"株式会社エナリス"}},
  {"code":"0x000073","descriptions":{"en":"NEC Platforms, Ltd.","ja":"NECプラットフォームズ株式会社"}},
  {"code":"0x000076","descriptions":{"en":"TSP CO.,Ltd","ja":"株式会社TSP"}},
  {"code":"0x000077","descriptions":{"en":"Kanagawa Institute of Technology","ja":"学校法人幾徳学園　神奈川工科大学"}},
  {"code":"0x000078","descriptions":{"en":"Maxell, Ltd.","ja":"マクセル株式会社"}},
  {"code":"0x000079","descriptions":{"en":"Anritsu Engineering Co.,Ltd,","ja":"アンリツエンジニアリング株式会社"}},
  {"code":"0x00007A","descriptions":{"en":"ZUKEN ELMIC,INC.","ja":"図研エルミック株式会社"}},
  {"code":"0x00007C","descriptions":{"en":"NSW Inc.","ja":"ＮＳＷ株式会社"}},
  {"code":"0x00007E","descriptions":{"en":"SMK Corporation","ja":"SMK株式会社"}},
  {"code":"0x00007F","descriptions":{"en":"ANRITSU CUSTOMER SUPPORT CO., LTD.","ja":"アンリツカスタマーサポート株式会社"}},
  {"code":"0x000080","descriptions":{"en":"DIAMOND&ZEBRA ELECTRIC MFG.CO.,LTD.","ja":"ダイヤゼブラ電機株式会社"}},
  {"code":"0x000081","descriptions":{"en":"IWATSU ELECTRIC CO., LTD.","ja":"岩崎通信機株式会社"}},
  {"code":"0x000082","descriptions":{"en":"PURPOSE CO.,LTD.","ja":"パーパス株式会社"}},
  {"code":"0x000083","descriptions":{"en":"Melco Techno Yokohama Corporation","ja":"株式会社メルコテクノ横浜"}},
  {"code":"0x000085","descriptions":{"en":"TAKAOKA TOKO CO.,LTD","ja":"株式会社東光高岳"}},
  {"code":"0x000086","descriptions":{"en":"NIPPON TELEGRAPH AND TELEPHONE WEST CORPORATION","ja":"西日本電信電話株式会社"}},
  {"code":"0x000087","descriptions":{"en":"I-O DATA DEVICE,INC.","ja":"株式会社アイ･オー･データ機器"}},
  {"code":"0x000088","descriptions":{"en":"CHOFU SEISAKUSHO CO.,LTD.","ja":"株式会社長府製作所"}},
  {"code":"0x00008A","descriptions":{"en":"FUJITSU GENERAL LIMITED","ja":"株式会社富士通ゼネラル"}},
  {"code":"0x00008C","descriptions":{"en":"Kyuden Technosystems Corporation","ja":"九電テクノシステムズ株式会社"}},
  {"code":"0x00008D","descriptions":{"en":"NIPPON TELEGRAPH AND TELEPHONE CORPORATION","ja":"日本電信電話株式会社"}},
  {"code":"0x00008F","descriptions":{"en":"Glamo Inc.","ja":"株式会社グラモ"}},
  {"code":"0x000090","descriptions":{"en":"Fujitsu Component Limited","ja":"富士通コンポーネント株式会社"}},
  {"code":"0x000091","descriptions":{"en":"NEC Platforms, Ltd.","ja":"NECプラットフォームズ株式会社"}},
  {"code":"0x000093","descriptions":{"en":"SATORI ELECTRIC CO.,LTD.","ja":"佐鳥電機株式会社"}},
  {"code":"0x000095","descriptions":{"en":"Yamato Denki Co.,Ltd.","ja":"大和電器株式会社"}},
  {"code":"0x000096","descriptions":{"en":"Azbil Corporation","ja":"アズビル株式会社"}},
  {"code":"0x000097","descriptions":{"en":"Future Technology Laboratories, Inc.","ja":"株式会社未来技術研究所"}},
  {"code":"0x000099","descriptions":{"en":"Tokyo Electric Power Company Holdings, Inc.","ja":"東京電力ホールディングス株式会社"}},
  {"code":"0x00009A","descriptions":{"en":"The Kansai Electric Power Co., Inc.","ja":"関西電力送配電株式会社"}},
  {"code":"0x00009B","descriptions":{"en":"GASTAR Co.,Ltd","ja":"株式会社ガスター"}},
  {"code":"0x00009C","descriptions":{"en":"Diamond Electric Mfg.Co.,Ltd.","ja":"ダイヤモンド電機株式会社"}},
  {"code":"0x00009E","descriptions":{"en":"YASKAWA ELECTRIC CORPORATION","ja":"株式会社安川電機"}},
  {"code":"0x00009F","descriptions":{"en":"GS Yuasa International Ltd","ja":"株式会社GSユアサ"}},
  {"code":"0x0000A0","descriptions":{"en":"NTT Advanced Technology Corporation","ja":"エヌ・ティ・ティ・アドバンステクノロジ株式会社"}},
  {"code":"0x0000A1","descriptions":{"en":"Honda R&D Co., Ltd.","ja":"株式会社本田技術研究所"}},
  {"code":"0x0000A3","descriptions":{"en":"Chubu Electric Power Grid Co.,Inc.","ja":"中部電力パワーグリッド株式会社"}},
  {"code":"0x0000A5","descriptions":{"en":"Nichibei Co., Ltd.","ja":"株式会社ニチベイ"}},
  {"code":"0x0000A8","descriptions":{"en":"Smart Power System. Co,. Ltd.","ja":"株式会社スマートパワーシステム"}},
  {"code":"0x0000AC","descriptions":{"en":"IDEC COROPRATION","ja":"IDEC株式会社"}},
  {"code":"0x0000AD","descriptions":{"en":"Delta Electronics (Japan), Inc.","ja":"デルタ電子株式会社"}},
  {"code":"0x0000AE","descriptions":{"en":"SHIKOKU ELECTRIC POWER CO.,INC.","ja":"四国電力株式会社"}},
  {"code":"0x0000AF","descriptions":{"en":"Takara Standard Co.,Ltd","ja":"タカラスタンダード株式会社"}},
  {"code":"0x0000B0","descriptions":{"en":"idea co.,ltd. ","ja":"株式会社イデア"}},
  {"code":"0x0000B1","descriptions":{"en":"Internet Initiative Japan Inc.","ja":"株式会社インターネットイニシアティブ"}},
  {"code":"0x0000B2","descriptions":{"en":"NF Blossom Technologies, Inc.","ja":"株式会社NFブロッサムテクノロジーズ"}},
  {"code":"0x0000B3","descriptions":{"en":"TOPPERS Project, Inc.","ja":"特定非営利活動法人TOPPERSプロジェクト"}},
  {"code":"0x0000B4","descriptions":{"en":"4R Energy Corporation","ja":"フォーアールエナジー株式会社"}},
  {"code":"0x0000B5","descriptions":{"en":"The Chugoku Electric Power Co., Ltd","ja":"中国電力株式会社"}},
  {"code":"0x0000B6","descriptions":{"en":"Bunka Shutter Co., Ltd","ja":"文化シヤッター株式会社"}},
  {"code":"0x0000B7","descriptions":{"en":"Nitto Kogyo Corporation","ja":"日東工業株式会社"}},
  {"code":"0x0000B8","descriptions":{"en":"Hokkaido Electric Power Co.,Inc.","ja":"北海道電力株式会社"}},
  {"code":"0x0000BA","descriptions":{"en":"SankyoTateyama, Inc.","ja":"三協立山株式会社"}},
  {"code":"0x0000BB","descriptions":{"en":"Hokuriku Electric Power Transmission & Distribution Company","ja":"北陸電力送配電株式会社"}},
  {"code":"0x0000BC","descriptions":{"en":"TohokuElectric Power Network Company,Incorporated","ja":"東北電力ネットワーク株式会社"}},
  {"code":"0x0000BE","descriptions":{"en":"DENKEN Co.,Ltd.","ja":"株式会社デンケン"}},
  {"code":"0x0000BF","descriptions":{"en":"KYUSHU ELECTRIC POWER TRANSMISSION AND DISTRIBUTION CO.,INC.","ja":"九州電力送配電株式会社"}},
  {"code":"0x0000C1","descriptions":{"en":"Tsuken Electric Ind Co., Ltd.","ja":"通研電気工業株式会社"}},
  {"code":"0x0000C2","descriptions":{"en":"Tohoku Electric Meter Industry Co.,Inc","ja":"東北計器工業株式会社"}},
  {"code":"0x0000C3","descriptions":{"en":"Japan Electric Meters Inspection Corporation","ja":"日本電気計器検定所"}},
  {"code":"0x0000C5","descriptions":{"en":"SANWA SHUTTER CORPORATION","ja":"三和シヤッター工業株式会社"}},
  {"code":"0x0000CA","descriptions":{"en":"JSP CO.,LTD.","ja":"株式会社ジェイエスピー"}},
  {"code":"0x0000CB","descriptions":{"en":"Fuji Electric Co.,Ltd","ja":"富士電機株式会社"}},
  {"code":"0x0000CC","descriptions":{"en":"Hitachi-Johnson Controls Air Conditioning,Inc.","ja":"日立ジョンソンコントロールズ空調株式会社"}},
  {"code":"0x0000CD","descriptions":{"en":"TOCLAS CORPORATION","ja":"トクラス株式会社"}},
  {"code":"0x0000CE","descriptions":{"en":"SHINDENGEN ELECTRIC MANUFACTURING CO.LTD.","ja":"新電元工業株式会社"}},
  {"code":"0x0000D0","descriptions":{"en":"TSUBAKIMOTO CHAIN CO.","ja":"株式会社椿本チエイン"}},
  {"code":"0x0000D2","descriptions":{"en":"CHOFUKOSAN.Co.Ltd","ja":"長府工産株式会社"}},
  {"code":"0x0000D4","descriptions":{"en":"Murata Manufacturing Co.,Ltd.","ja":"株式会社村田製作所"}},
  {"code":"0x0000D5","descriptions":{"en":"Choshu Industry Co., Ltd.","ja":"長州産業株式会社"}},
  {"code":"0x0000D7","descriptions":{"en":"Kaga Electronics co.,ltd.","ja":"加賀電子株式会社"}},
  {"code":"0x0000D8","descriptions":{"en":"OSAKI DATATECH CO.,LTD.","ja":"大崎データテック株式会社"}},
  {"code":"0x0000D9","descriptions":{"en":"Toshiba IT & Control Systems Corporation","ja":"東芝ITコントロールシステム株式会社"}},
  {"code":"0x0000DA","descriptions":{"en":"Panasonic Commercial Equipment Systems Co.,Ltd.","ja":"パナソニック産機システムズ株式会社"}},
  {"code":"0x0000DB","descriptions":{"en":"Suntech Power Japan Corporation","ja":"サンテックパワージャパン株式会社"}},
  {"code":"0x0000DC","descriptions":{"en":"NIHON TECHNO CO.,LTD.","ja":"日本テクノ株式会社"}},
  {"code":"0x0000DD","descriptions":{"en":"EneStone Corporation","ja":"株式会社エナ・ストーン"}},
  {"code":"0x0000DE","descriptions":{"en":"FUJIFILM Business Innovation Japan Corp","ja":"富士フイルムビジネスイノベーションジャパン株式会社"}},
  {"code":"0x0000DF","descriptions":{"en":"SMA Japan K.K.","ja":"SMAジャパン株式会社"}},
  {"code":"0x0000E0","descriptions":{"en":"Looop Inc","ja":"株式会社Looop"}},
  {"code":"0x0000E1","descriptions":{"en":"SoftBank Corp.","ja":"ソフトバンク株式会社"}},
  {"code":"0x0000E2","descriptions":{"en":"NextDrive Inc.","ja":"NextDrive株式会社"}},
  {"code":"0x0000E3","descriptions":{"en":"DDL Co.,Ltd","ja":"株式会社ディーディーエル"}},
  {"code":"0x0000E4","descriptions":{"en":"technoeye Inc.","ja":"株式会社テクノアイ"}},
  {"code":"0x0000E5","descriptions":{"en":"Hitachi Power Solutions Co.,Ltd.","ja":"株式会社日立パワーソリューションズ"}},
  {"code":"0x0000E6","descriptions":{"en":"Hokkaido Electrical Safety Services Foundation","ja":"一般財団法人北海道電気保安協会"}},
  {"code":"0x0000E8","descriptions":{"en":"KOIZUMI LIGHTING TECHNOLOGY CORP.","ja":"コイズミ照明株式会社"}},
  {"code":"0x0000E9","descriptions":{"en":"NTT Smile Energy Inc.","ja":"株式会社NTTスマイルエナジー"}},
  {"code":"0x0000EB","descriptions":{"en":"NICHICON (KAMEOKA) CORPORATION","ja":"ニチコン亀岡株式会社"}},
  {"code":"0x0000EC","descriptions":{"en":"Toshiba Energy Systems & Solutions Corporation","ja":"東芝エネルギーシステムズ株式会社"}},
  {"code":"0x0000ED","descriptions":{"en":"INFINI Co. LTD","ja":"アンフィニ株式会社"}},
  {"code":"0x0000EE","descriptions":{"en":"TESSERA TECHNOLOGY INC.","ja":"テセラ・テクノロジー株式会社"}},
  {"code":"0x0000EF","descriptions":{"en":"TOYOTA INDUSTRIES CORPORATION","ja":"株式会社豊田自動織機"}},
  {"code":"0x0000F0","descriptions":{"en":"KANEKA CORPORATION","ja":"株式会社カネカ"}},
  {"code":"0x0000F1","descriptions":{"en":"Laplace Systems Co., Ltd.","ja":"株式会社ラプラス・システム"}},
  {"code":"0x0000F2","descriptions":{"en":"Energy Solutions Inc.","ja":"エナジー・ソリューションズ株式会社"}},
  {"code":"0x0000F3","descriptions":{"en":"Energy Gateway, Inc","ja":"株式会社エナジーゲートウェイ"}},
  {"code":"0x0000F4","descriptions":{"en":"DENSO AIRCOOL CORPORATION","ja":"株式会社デンソーエアクール"}},
  {"code":"0x0000F5","descriptions":{"en":"ODELIC CO., LTD.","ja":"オーデリック株式会社"}},
  {"code":"0x0000F6","descriptions":{"en":"Field Logic Inc.","ja":"株式会社フィールドロジック"}},
  {"code":"0x0000F7","descriptions":{"en":"JCity,Inc.","ja":"株式会社ジェイシティ"}},
  {"code":"0x0000F8","descriptions":{"en":"CIMX INITIATIVE INC.","ja":"株式会社シムックスイニシアティブ"}},
  {"code":"0x0000F9","descriptions":{"en":"TOHO ELECTRONICS INC.","ja":"東邦電子株式会社"}},
  {"code":"0x0000FA","descriptions":{"en":"Plat'Home Co., Ltd.","ja":"ぷらっとホーム株式会社"}},
  {"code":"0x0000FB","descriptions":{"en":"CICO CORPORATION","ja":"志幸技研工業株式会社"}},
  {"code":"0x0000FC","descriptions":{"en":"FUJI INDUSTRIAL CO.,Ltd.","ja":"富士工業株式会社"}},
  {"code":"0x0000FD","descriptions":{"en":"Bellnix Co.,LTD","ja":"株式会社ベルニクス"}},
  {"code":"0x0000FE","descriptions":{"en":"Panasonic Ecology Systems Co.,Ltd.","ja":"パナソニック エコシステムズ株式会社"}},
  {"code":"0x0000FF","descriptions":{"en":"TEPCO Energy Partner, Inc.","ja":"東京電力エナジーパートナー株式会社"}},
  {"code":"0x000100","descriptions":{"en":"Smart Solar Corporation","ja":"スマートソーラー株式会社"}},
  {"code":"0x000101","descriptions":{"en":"Sunpot Co., Ltd","ja":"サンポット株式会社"}},
  {"code":"0x000102","descriptions":{"en":"NICHICON (KUSATSU) CORPORATION","ja":"ニチコン草津株式会社"}},
  {"code":"0x000103","descriptions":{"en":"Data Technology Inc.","ja":"データテクノロジー株式会社"}},
  {"code":"0x000104","descriptions":{"en":"Next Energy & Resources Co., Ltd.","ja":"ネクストエナジー・アンド・リソース株式会社"}},
  {"code":"0x000105","descriptions":{"en":"Mitsubishi Electric Lighting Corporation","ja":"三菱電機照明株式会社"}},
  {"code":"0x000106","descriptions":{"en":"Nature Inc.","ja":"Nature株式会社 "}},
  {"code":"0x000107","descriptions":{"en":"SEIKO ELECTRIC CO.,LTD.","ja":"株式会社正興電機製作所"}},
  {"code":"0x000108","descriptions":{"en":"SOUSEI Technology Inc.","ja":"株式会社SOUSEI Technology"}},
  {"code":"0x000109","descriptions":{"en":"DENSO Co.,LTD.","ja":"株式会社デンソー ( https://www.kk-denso.co.jp/ )"}},
  {"code":"0x00010A","descriptions":{"en":"ENERGY GAP CORPORATION","ja":"株式会社エネルギーギャップ"}},
  {"code":"0x00010B","descriptions":{"en":"KITANIHON ELECTRIC CABLE CO.,LTD.","ja":"株式会社北日本電線"}},
  {"code":"0x00010C","descriptions":{"en":"MAX CO., LTD.","ja":"マックス株式会社"}},
  {"code":"0x00010D","descriptions":{"en":"Shizen Energy Inc.","ja":"自然電力株式会社"}},
  {"code":"0x00010E","descriptions":{"en":"SANIX INCORPORATED","ja":"株式会社サニックス"}},
  {"code":"0x00010F","descriptions":{"en":"Iwatani Corporation","ja":"岩谷産業株式会社"}},
  {"code":"0x000110","descriptions":{"en":"ASUKA SOLUTION COMPANY LIMITED","ja":"株式会社あすかソリューション"}},
  {"code":"0x000111","descriptions":{"en":"Topre Corporation","ja":"東プレ株式会社"}},
  {"code":"0x000112","descriptions":{"en":"NICHIEI INTEC CO., LTD","ja":"日栄インテック株式会社"}},
  {"code":"0x000113","descriptions":{"en":"EBARA JITSUGYO CO., LTD","ja":"荏原実業株式会社"}},
  {"code":"0x000114","descriptions":{"en":"OkayaKiden Co.,Ltd.","ja":"岡谷機電株式会社"}},
  {"code":"0x000115","descriptions":{"en":"HUAWEI TECHNOLOGIES JAPAN K.K.","ja":"華為技術日本株式会社"}},
  {"code":"0x000116","descriptions":{"en":"Sungrow Power Supply Co., Ltd.","ja":"Sungrow Power Supply Co., Ltd."}},
  {"code":"0x000117","descriptions":{"en":"WWB Corporation","ja":"WWB株式会社"}},
  {"code":"0x000118","descriptions":{"en":"NEC Magnus Communications, Ltd","ja":"ＮＥＣマグナスコミュニケーションズ株式会社"}},
  {"code":"0x000119","descriptions":{"en":"DAIHEN Corporation","ja":"株式会社ダイヘン"}},
  {"code":"0x00011A","descriptions":{"en":"ACCESS CO.,LTD.","ja":"株式会社ACCESS"}},
  {"code":"0x00011B","descriptions":{"en":"SolaX Power Network Technology (Zhe jiang) Co. , Ltd.","ja":"SolaX Power Network Technology (Zhe jiang) Co. , Ltd."}},
  {"code":"0x00011C","descriptions":{"en":"SANDEN RETAIL SYSTEMS CORPORATION","ja":"サンデン・リテールシステム株式会社"}},
  {"code":"0x00011D","descriptions":{"en":"mui Lab, Inc.","ja":"mui Lab株式会社"}},
  {"code":"0x00011E","descriptions":{"en":"SAKAIGAWA CO., LTD","ja":"株式会社サカイガワ"}},
  {"code":"0x00011F","descriptions":{"en":"TOYOTA TSUSHO CORPORATION","ja":"豊田通商株式会社"}},
  {"code":"0x000120","descriptions":{"en":"Meisei electric co.,ltd.","ja":"明星電気株式会社"}},
  {"code":"0x000121","descriptions":{"en":"TOYOTA MOTOR CORPORATION","ja":"トヨタ自動車株式会社"}},
  {"code":"0x000122","descriptions":{"en":"Hanwha Q CELLS Japan CO.,LTD.","ja":"ハンファＱセルズジャパン株式会社"}},
  {"code":"0x000123","descriptions":{"en":"Contec Co., Ltd.","ja":"株式会社コンテック"}},
  {"code":"0x000124","descriptions":{"en":"INTEC Inc.","ja":"株式会社インテック"}},
  {"code":"0x000125","descriptions":{"en":"LiveSmart KK","ja":"株式会社LiveSmart"}},
  {"code":"0x000126","descriptions":{"en":"Togami Electric Mfg.co.,Ltd.","ja":"株式会社戸上電機製作所"}},
  {"code":"0x000127","descriptions":{"en":"Paloma Co.,Ltd.","ja":"株式会社パロマ"}},
  {"code":"0x000128","descriptions":{"en":"SAIKOH ENGINEERING Co.,Ltd.","ja":"埼広エンジニヤリング株式会社"}},
  {"code":"0x000129","descriptions":{"en":"GoodWe Japan K.K","ja":"GoodWe　Japan株式会社"}},
  {"code":"0x00012A","descriptions":{"en":"Monochrome Inc.","ja":"株式会社モノクローム"}},
  {"code":"0x00012B","descriptions":{"en":"DENSO WAVE INCORPORATED","ja":"株式会社デンソーウェーブ"}},
  {"code":"0x00012C","descriptions":{"en":"Onamba Co., Ltd.","ja":"オーナンバ株式会社"}},
  {"code":"0x00012D","descriptions":{"en":"TACHIKAWA CORPORATION","ja":"立川ブラインド工業株式会社"}},
  {"code":"0x00012E","descriptions":{"en":"Eneres Co.,Ltd.","ja":"エネクラウド株式会社"}},
  {"code":"0x00012F","descriptions":{"en":"FORMOSA BIO AND ENERGY CORP JAPAN","ja":"台湾プラスチックジャパンニューエナジー株式会社"}},
  {"code":"0x000130","descriptions":{"en":"COOLDESIGN Corporation","ja":"株式会社クールデザイン"}},
  {"code":"0x000131","descriptions":{"en":"Shenzhen Eternalplanet Energy Pingshan Ltd.","ja":"Shenzhen Eternalplanet Energy Pingshan Ltd."}},
  {"code":"0x000132","descriptions":{"en":"EX4Energy, Inc.","ja":"EX4Energy株式会社"}},
  {"code":"0x000133","descriptions":{"en":"afterFIT Co., Ltd.","ja":"株式会社afterFIT"}},
  {"code":"0x000134","descriptions":{"en":"GoodWe Technologies Co.,Ltd.","ja":"GoodWe Technologies Co.,Ltd."}},
  {"code":"0x000135","descriptions":{"en":"LinkJapan Inc.","ja":"株式会社リンクジャパン"}},
  {"code":"0x000136","descriptions":{"en":"Chuo Bussan Co.,Ltd.","ja":"株式会社中央物産"}},
  {"code":"0x000137","descriptions":{"en":"OkayaKiden Co.,Ltd.","ja":"岡谷機電株式会社"}},
  {"code":"0x000138","descriptions":{"en":"TRENDE Inc.","ja":"TRENDE株式会社"}},
  {"code":"0x000139","descriptions":{"en":"RATOC Systems, Inc.","ja":"ラトックシステム株式会社"}},
  {"code":"0x00013A","descriptions":{"en":"GUGEN,Inc.","ja":"株式会社ＧＵＧＥＮ"}},
  {"code":"0x00013B","descriptions":{"en":"Crossdoor Inc.","ja":"株式会社Crossdoor"}},
  {"code":"0x00013D","descriptions":{"en":"NIPPON GAS CO.,LTD.","ja":"日本瓦斯株式会社"}},
  {"code":"0x00013E","descriptions":{"en":"i GRID SOLUTIONS Inc.","ja":"株式会社アイ・グリッド・ソリューションズ"}},
  {"code":"0x00013F","descriptions":{"en":"Energy Pool Japan K.K.","ja":"エナジープールジャパン株式会社"}},
  {"code":"0x000140","descriptions":{"en":"Landis+Gyr AG","ja":"Landis+Gyr AG"}},
];


class EchoNetDefinitionRepository
{
  static definitionsCache:ElDefinitions|undefined;
  static superClassCache:ElDeviceDescription|undefined;
  static deviceDescriptionCache:{[key:string]:ElDeviceDescription|undefined} = {};

  public getDefinition():ElDefinitions
  {
    if(EchoNetDefinitionRepository.definitionsCache===undefined)
    {
      const definitionsJsonPath = path.join(__dirname, "../MRA_V1.1.1/mraData/definitions/definitions.json");
      const definitionsText = fs.readFileSync(definitionsJsonPath, {encoding:"utf8"});
      EchoNetDefinitionRepository.definitionsCache = JSON.parse(definitionsText) as ElDefinitions;
    }
    return EchoNetDefinitionRepository.definitionsCache;
  }

  public getSuperClass():ElDeviceDescription
  {
    if(EchoNetDefinitionRepository.superClassCache===undefined)
    {
      const superClassJsonPath = path.join(__dirname, `../MRA_V1.1.1/mraData/superClass/0x0000.json`);
      const superClassText = fs.readFileSync(superClassJsonPath, {encoding:"utf8"});
      EchoNetDefinitionRepository.superClassCache = JSON.parse(superClassText) as ElDeviceDescription;
    }
    return EchoNetDefinitionRepository.superClassCache;
  }

  public getClass(eojClass:string):ElDeviceDescription|undefined
  {
    if(eojClass in EchoNetDefinitionRepository.deviceDescriptionCache)
    {
      return EchoNetDefinitionRepository.deviceDescriptionCache[eojClass];
    }

    const superClass = this.getSuperClass();

    let device:ElDeviceDescription|undefined = undefined;
    if(device === undefined)
    {
      const deviceJsonPath = path.join(__dirname, `../MRA_custom/${eojClass}.json`);
      if(fs.existsSync(deviceJsonPath))
      {
        const deviceText = fs.readFileSync(deviceJsonPath, {encoding:"utf8"});
        device = JSON.parse(deviceText) as ElDeviceDescription;
        device.elProperties.push(...superClass.elProperties);
      }
    }
    if(device === undefined)
    {
      const deviceJsonPath = path.join(__dirname, `../MRA_V1.1.1/mraData/devices/${eojClass}.json`);
      if(fs.existsSync(deviceJsonPath))
      {
        const deviceText = fs.readFileSync(deviceJsonPath, {encoding:"utf8"});
        device = JSON.parse(deviceText) as ElDeviceDescription;
        device.elProperties.push(...superClass.elProperties);
      }
    }

    if(device === undefined && eojClass.toLowerCase() === "0x0ef0")
    {
      const deviceJsonPath = path.join(__dirname, `../MRA_V1.1.1/mraData/nodeProfile/${eojClass}.json`);
      const deviceText = fs.readFileSync(deviceJsonPath, {encoding:"utf8"});
      device = JSON.parse(deviceText) as ElDeviceDescription;
      device.elProperties.push(...superClass.elProperties);
    }

    EchoNetDefinitionRepository.deviceDescriptionCache[eojClass]=device;

    return device;
  }

}


export class EchoNetOpenApiConverter
{
  
  public toOpenApiSchema(dataType:ElDataType):OpenAPIV3.SchemaObject
  {
    if("type" in dataType)
    {
      switch(dataType.type)
      {
        case "array":
          return this.ArrayToOpenApiSchema(dataType);
        case "bitmap":
          return this.BitmapToOpenApiSchema(dataType);
        case "date":
          return this.DateToOpenApiSchema(dataType);
        case "date-time":
          return this.DateTimeToOpenApiSchema(dataType);
        case "level":
          return this.LevelToOpenApiSchema(dataType);
        case "number":
          return this.NumberToOpenApiSchema(dataType);
        case "numericValue":
          return this.NumericValueToOpenApiSchema(dataType);
        case "object":
          return this.ObjectToOpenApiSchema(dataType);
        case "raw":
          return this.RawToOpenApiSchema(dataType);
        case "state":
          return this.StateToOpenApiSchema(dataType);
        case "time":
          return this.TimeToOpenApiSchema(dataType);
        default:
          throw Error("Unexpected");
      }
    }
    else if("$ref" in dataType)
    {
      throw Error("Unexpected");
    }
    else if("oneOf" in dataType)
    {
      const result:OpenAPIV3.SchemaObject = {oneOf:[]};
      for(const item of dataType.oneOf)
      {
        result.oneOf?.push(this.toOpenApiSchema(item));
      }
      return result;
    }    
    throw Error("Unexpected");  
  }
  ArrayToOpenApiSchema(dataType: ElArrayType): OpenAPIV3.ArraySchemaObject {
    return {
      type: "array",
      items: this.toOpenApiSchema(dataType.items),
      maxItems: dataType.maxItems,
      minItems: dataType.minItems,
    };
  }
  BitmapToOpenApiSchema(dataType: ElBitmapType): OpenAPIV3.SchemaObject {
    const properties:{[key:string]:OpenAPIV3.SchemaObject} = {};
    for(const prop of dataType.bitmaps)
    {
      properties[prop.name] = this.toOpenApiSchema(prop.value);
    }
    return {
      type: "object",
      properties,
    };
  }
  DateToOpenApiSchema(dataType: ElDateType): OpenAPIV3.SchemaObject {
    return {
      type: "string",
      format: "date",
    };
  }
  DateTimeToOpenApiSchema(dataType: ElDateTimeType): OpenAPIV3.SchemaObject {
    return {
      type: "string"
    };
  }
  LevelToOpenApiSchema(dataType: ElLevelType): OpenAPIV3.SchemaObject {
    return {
      type: "integer",
      minimum: 1,
      maximum: dataType.maximum,
    }
  }
  NumberToOpenApiSchema(dataType: ElNumberType): OpenAPIV3.SchemaObject {
    let result:OpenAPIV3.SchemaObject = {
      type: "number",
    };
    
    if(dataType.minimum !== undefined)
    {
      result.minimum = dataType.minimum;
    }
    if(dataType.maximum !== undefined)
    {
      result.maximum = dataType.maximum;
    }
    if(dataType.multiple !== undefined)
    {
      result.multipleOf = dataType.multiple;
    }
    if(dataType.enum !== undefined)
    {
      result.enum = dataType.enum;
    }
    if(dataType.overflowCode===false && dataType.underflowCode===false)
    {
      return result;
    }
    const underflowOverflowSchema:OpenAPIV3.SchemaObject = {type:"string", enum:[]};
    if(dataType.underflowCode)
    {
      underflowOverflowSchema.enum?.push("underflow");
    }
    if(dataType.overflowCode)
    {
      underflowOverflowSchema.enum?.push("overflow");
    }
    return {
      oneOf: [
        result,
        underflowOverflowSchema
      ]
    }
  }
  NumericValueToOpenApiSchema(dataType: ElNumericValueType): OpenAPIV3.SchemaObject {
    return {
      type: "number",
      enum: dataType.enum.map(_=>_.numericValue),
    }
  }
  ObjectToOpenApiSchema(dataType: ElObjectType): OpenAPIV3.SchemaObject {
    const properties:{[key:string]:OpenAPIV3.SchemaObject} = {};
    for(const prop of dataType.properties)
    {
      properties[prop.shortName] = this.toOpenApiSchema(prop.element);
    }
    return {
      type: "object",
      properties,
    };
  }
  RawToOpenApiSchema(dataType: ElRawType): OpenAPIV3.SchemaObject {
    return {
      type: "string",
      format: "hex",
      minLength: dataType.minSize * 2,
      maxLength: dataType.maxSize * 2,
    }
  }
  StateToOpenApiSchema(dataType: ElStateType): OpenAPIV3.SchemaObject {
    return {
      type: "string",
      enum: dataType.enum.map(_=>_.name),
    }
  }
  TimeToOpenApiSchema(dataType: ElTimeType): OpenAPIV3.SchemaObject {
    return {
      type: "string",
      format: "time",
    };
  }
}
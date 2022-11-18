import { ElArrayType, ElBitmapType, ElDataType, ElDateTimeType, ElDateType, ElDefinitions, ElDeviceDescription, ElLevelType, ElMixedOneOfType, ElNumberType, ElNumericValueType, ElObjectType, ElPropertyDescription, ElRawType, ElStateType, ElTimeType } from "./MraTypes";
import path from "path";
import fs from "fs";

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
  public getAllDeviceClasses():string[]
  {
    const files = fs.readdirSync(path.join(__dirname, `../MRA_V1.1.1/mraData/devices`));
    const classes = files.map(_=>_.match(/0x([0-9A-F]+)\.json/)).filter(_=>_!==null).map(_=>_===null?"":_[1]);
    return classes;
  }
  public getDevice(eojClass:string):ElDeviceDescription | undefined
  {
    const definitionsJsonPath = path.join(__dirname, "../MRA_V1.1.1/mraData/definitions/definitions.json");
    const definitionsText = fs.readFileSync(definitionsJsonPath, {encoding:"utf8"});
    const definitions = JSON.parse(definitionsText) as ElDefinitions;

    const superClassJsonPath = path.join(__dirname, `../MRA_V1.1.1/mraData/superClass/0x0000.json`);
    const superClassText = fs.readFileSync(superClassJsonPath, {encoding:"utf8"});
    const superClass = JSON.parse(superClassText) as ElDeviceDescription;

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
  
}
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
    const deviceJsonPath = path.join(__dirname, `../MRA_V1.1.1/mraData/devices/${eojClass}.json`);
    if(fs.existsSync(deviceJsonPath))
    {
      const deviceText = fs.readFileSync(deviceJsonPath, {encoding:"utf8"});
      device = JSON.parse(deviceText) as ElDeviceDescription;
      device.elProperties.push(...superClass.elProperties);
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
      for(let itemType of dataType.oneOf)
      {
        const result = this.toEchoNetLiteData(itemType, value);
        if(result !== undefined)
        {
          return result;
        }
      }
    }    
    return undefined;
  }

  private DateTimeToEchoNetLiteData(dataType:ElDateTimeType, value:any):string|undefined
  {
    const valueText = value.toString();
    const year  = valueText.substr(0,4);
    const month = valueText < 7  ? "01" : valueText.substr(5,2);
    const day   = valueText < 10 ? "01" : valueText.substr(8,2);
    const hour  = valueText < 13 ? "00" : valueText.substr(11,2);
    const minute= valueText < 16 ? "00" : valueText.substr(14,2);
    const second= valueText < 19 ? "00" : valueText.substr(17,2); 
    const size = dataType?.size ?? 7;
    let result = "";
    if(size >= 2)
    {
      result += parseInt(year, 10).toString(16);
    }
    if(size >= 3)
    {
      result += parseInt(month, 10).toString(16);
    }
    if(size >= 4)
    {
      result += parseInt(day, 10).toString(16);
    }
    if(size >= 5)
    {
      result += parseInt(hour, 10).toString(16);
    }
    if(size >= 6)
    {
      result += parseInt(minute, 10).toString(16);
    }
    if(size >= 7)
    {
      result += parseInt(second, 10).toString(16);
    }
    return result;
  }
  
  private DateToEchoNetLiteData(schema:ElDateType, value:any):string|undefined
  {
    const valueText = value.toString();
    const year  = valueText.substr(0,4);
    const month = valueText < 7  ? "01" : valueText.substr(5,2);
    const day   = valueText < 10 ? "01" : valueText.substr(8,2);
    const size = schema?.size ?? 4;
    let result = "";
    if(size >= 2)
    {
      result += parseInt(year, 10).toString(16);
    }
    if(size >= 3)
    {
      result += parseInt(month, 10).toString(16);
    }
    if(size >= 4)
    {
      result += parseInt(day, 10).toString(16);
    }
    return result;
  }
  
  private TimeToEchoNetLiteData(schema:ElTimeType, value:any):string|undefined
  {
    const valueText = value.toString();
    const hour  = valueText < 0 ? "00" : valueText.substr(0,2);
    const minute= valueText < 5 ? "00" : valueText.substr(3,2);
    const second= valueText < 8 ? "00" : valueText.substr(6,2); 
    const size = schema?.size ?? 3;
    let result = "";
    if(size >= 1)
    {
      result += parseInt(hour, 10).toString(16);
    }
    if(size >= 2)
    {
      result += parseInt(minute, 10).toString(16);
    }
    if(size >= 3)
    {
      result += parseInt(second, 10).toString(16);
    }
    return result;
  }

  private NumberToEchoNetLiteData(schema:ElNumberType, value:any):string|undefined
  {
    if(typeof(value) !== "number")
    {
      return undefined;
    }
    const value2 = value / (schema.multiple ?? 1);
    switch(schema.format)
    {
      case "int8":
        return (value2 >>> 0).toString(16).substr(0,2);
      case "int16":
        return (value2 >>> 0).toString(16).substr(0,4);
      case "int32":
        return (value2 >>> 0).toString(16).substr(0,8);
      case "uint8":
        return (value2).toString(16).substr(0,2);
      case "uint16":
        return (value2).toString(16).substr(0,4);
      case "uint32":
        return (value2).toString(16).substr(0,8);
    }
  }

  private StateToEchoNetLiteData(schema:ElStateType, value:any):string|undefined
  {
    const valueText = value.toString();
    const matchEnum = schema.enum.find(_=>_.name === valueText);
    if(matchEnum === undefined)
    {
      return undefined;
    }
    return matchEnum.edt;
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
    return matchEnum.edt;
  }

  private LevelToEchoNetLiteData(schema:ElLevelType, value:any):string|undefined
  {
    if(typeof(value) !== "number")
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

    let result = [0x00,0x00,0x00,0x00];

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

      for(let i = 1; i<8;i++)
      {
        if((prop.position.bitMask >> i) !== prop.position.bitMask)
        {
          itemHexTextNum = itemHexTextNum << (i-1);
          break;
        }
      }
      itemHexTextNum = itemHexTextNum & prop.position.bitMask;
      result[prop.position.index] |= itemHexTextNum;
    }
    return result.map(_=>_.toString(16)).join("").substr(0, schema.size*2);
  }

  private RawToEchoNetLiteData(schema:ElRawType, value:any):string|undefined
  {
    if(typeof(value) !== "string")
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
      for(let itemType of dataType.oneOf)
      {
        const result = this.toObject(itemType, value);
        if(result !== undefined)
        {
          return result;
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

    const year = parseInt( value.substr(0, 4), 16);
    const month = parseInt( value.substr(4, 2), 16);
    const day = parseInt( value.substr(6, 2), 16);
    const hours = parseInt( value.substr(8, 2), 16);
    const minutes = value.length >=12 ? parseInt( value.substr(10, 2), 16) : -1;
    const seconds = value.length >=14 ? parseInt( value.substr(12, 2), 16) : -1;

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
  private EchoNetLiteDataToDate(schema:ElDateType, value:string):string|undefined{
    const size = schema.size ?? 7
    if(value.length != size * 2)
    {
      return undefined;
    }

    const year = parseInt( value.substr(0, 4), 16);
    const month = value.length >=6 ?parseInt( value.substr(4, 2), 16) : -1;
    const day = value.length >=8 ? parseInt( value.substr(6, 2), 16) : -1;

    if(month === -1)
    {
      return `${year}`;
    }
    if(day === -1)
    {
      return `${year}-${month}`;
    }
    return `${year}-${month}-${day}`;
  }
  private EchoNetLiteDataToTime(schema:ElTimeType, value:string):string|undefined{
    const size = schema.size ?? 7
    if(value.length != size * 2)
    {
      return undefined;
    }

    const hours = parseInt( value.substr(0, 2), 16);
    const minutes = value.length >=4 ? parseInt( value.substr(2, 2), 16) : -1;
    const seconds = value.length >=6 ? parseInt( value.substr(4, 2), 16) : -1;

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

  

  private EchoNetLiteDataToNumber(schema:ElNumberType, value:string):number|undefined
  {
    let returnValue = 0;
    switch(schema.format)
    {
      case "int8":
        returnValue = hexToSignedInt(value.substr(0, 2));
      case "int16":
        returnValue = hexToSignedInt(value.substr(0, 4));
      case "int32":
        returnValue = hexToSignedInt(value.substr(0, 8));
      case "uint8":
        returnValue = parseInt(value.substr(0, 2), 16);
      case "uint16":
        returnValue = parseInt(value.substr(0, 4), 16);
      case "uint32":
        returnValue = parseInt(value.substr(0, 8), 16);
    }
    returnValue *= (schema.multiple ?? 1);

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
    return cur - base + 1;
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
      itemNumValue = itemNumValue & prop.position.bitMask;
      for(let i = 1; i<8;i++)
      {
        if((prop.position.bitMask >> i) !== prop.position.bitMask)
        {
          itemNumValue = itemNumValue >> (i-1);
          break;
        }
      }
      const itemHexValue2 = itemNumValue.toString(16);
      const itemValue = this.toObject(prop.value, itemHexValue2);
      returnValue[prop.name] = itemValue;
    }
    return returnValue;
  }

  private EchoNetLiteDataToRaw(schema:ElRawType, value:string):string|undefined
  {
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
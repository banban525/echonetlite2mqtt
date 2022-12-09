export interface ElDefinitions{
  definitions:{[key:string]:ElDataType};
}

export interface ElRefType{
  "$ref":string;
}

export class ElRefType
{
  static isMatch(dataType:ElRefType, value:number|string|object):boolean
  {
    return false;
  }
}

export interface ElMixedOneOfType{
  oneOf:ElDataType[];
}

export function isMatchToElDataType(dataType:ElDataType, value:number|string|object):boolean
{
  if("type" in dataType)
  {
    if(dataType.type === "array")
    {
      return ElArrayType.isMatch(dataType, value);
    }
    if(dataType.type === "bitmap")
    {
      return ElBitmapType.isMatch(dataType, value);
    }
    if(dataType.type === "date")
    {
      return ElDateType.isMatch(dataType, value);
    }
    if(dataType.type === "date-time")
    {
      return ElDateTimeType.isMatch(dataType, value);
    }
    if(dataType.type === "time")
    {
      return ElTimeType.isMatch(dataType, value);
    }
    if(dataType.type === "level")
    {
      return ElLevelType.isMatch(dataType, value);
    }
    if(dataType.type === "number")
    {
      return ElNumberType.isMatch(dataType, value);
    }
    if(dataType.type === "numericValue")
    {
      return ElNumericValueType.isMatch(dataType, value);
    }
    if(dataType.type === "object")
    {
      return ElObjectType.isMatch(dataType, value);
    }
    if(dataType.type === "raw")
    {
      return ElRawType.isMatch(dataType, value);
    }
    if(dataType.type === "state")
    {
      return ElStateType.isMatch(dataType, value);
    }
    return false;
  }
  else
  {
    if("oneOf" in dataType)
    {
      return ElMixedOneOfType.isMatch(dataType, value);
    }
    else
    {
      //data.$ref
      return false;
    }
  }
}

export class ElMixedOneOfType
{
  static isMatch(dataType:ElMixedOneOfType, value:number|string|object):boolean
  {
    for(const item of dataType.oneOf)
    {
      if(isMatchToElDataType(item, value))
      {
        return true;
      }
    }
    return false;
  }

  public static searchSelectedIndex(dataType:ElMixedOneOfType, value:number|string|object):number
  {
    for(let index = 0; index < dataType.oneOf.length; index++)
    {
      const subDataType = dataType.oneOf[index];
      if(typeof(value) === "number")
      {
        if("type" in subDataType)
        {
          if(subDataType.type === "number")
          {
            if(subDataType.enum !== undefined)
            {
              if(ElNumberType.isMatch(subDataType, value))
              {
                return index;
              }
            }
          }
          if(subDataType.type === "numericValue")
          {
            if(ElNumericValueType.isMatch(subDataType, value))
            {
              return index;
            }
          }
          continue;
        }
      }
      if(typeof(value) === "string")
      {
        if("type" in subDataType)
        {
          if(subDataType.type === "state")
          {
            if(ElStateType.isMatch(subDataType, value))
            {
              return index;
            }
          }
          continue;
        }
      }
      if(typeof(value)==="object")
      {
        if("type" in subDataType)
        {
          if(subDataType.type === "array")
          {
            if(ElArrayType.isMatch(subDataType, value))
            {
              return index;
            }
          }
          if(subDataType.type === "object")
          {
            if(ElObjectType.isMatch(subDataType, value))
            {
              return index;
            }
          }
          if(subDataType.type === "bitmap")
          {
            if(ElBitmapType.isMatch(subDataType, value))
            {
              return index;
            }
          }
        }
      }
    }
    for(let index = 0; index < dataType.oneOf.length; index++)
    {
      const subDataType = dataType.oneOf[index];
      if(typeof(value) === "number")
      {
        if("type" in subDataType)
        {
          if(subDataType.type === "level")
          {
            if(ElLevelType.isMatch(subDataType, value))
            {
              return index;
            }
          }
          if(subDataType.type === "number")
          {
            if(ElNumberType.isMatch(subDataType, value))
            {
              return index;
            }
          }
        }
      }
      if(typeof(value) === "string")
      {
        if("type" in subDataType)
        {
          if(subDataType.type === "date")
          {
            if(ElDateType.isMatch(subDataType, value))
            {
              return index;
            }
          }
          if(subDataType.type === "date-time")
          {
            if(ElDateTimeType.isMatch(subDataType, value))
            {
              return index;
            }
          }
          if(subDataType.type === "time")
          {
            if(ElTimeType.isMatch(subDataType, value))
            {
              return index;
            }
          }
          if(subDataType.type === "raw")
          {
            if(ElRawType.isMatch(subDataType, value))
            {
              return index;
            }
          }
        }
      }
    }

    return 0;
  }
}

export interface ElObjectType{
  type: "object";
  properties: {
    elementName: {
      ja: string;
      en: string;
    };
    shortName: string;
    element: ElDataType;
  }[]
}

export class ElObjectType
{
  static isMatch(dataType:ElObjectType, value:number|string|object):boolean
  {
    if(typeof(value) !== "object")
    {
      return false;
    }
    for(const prop of dataType.properties)
    {
      if((prop.shortName in value)===false)
      {
        return false;
      }
      if(isMatchToElDataType(prop.element, (value as any)[prop.shortName])===false)
      {
        return false;
      }
    }

    return true;
  }
}

export interface ElArrayType{
  type:"array";
  itemSize: number;
  minItems?: number;
  maxItems: number;
  items: ElDataType;
}

export class ElArrayType
{
  static isMatch(dataType:ElArrayType, value:number|string|object):boolean
  {
    if(Array.isArray(value) === false)
    {
      return false;
    }
    if(dataType.minItems !== undefined)
    {
      if((value as any).length < dataType.minItems)
      {
        return false;
      }
    }
    if((value as any).length > dataType.maxItems)
    {
      return false;
    }
    return true;
  }
}

export interface ElRawType{
  type:"raw",
  minSize:number,
  maxSize:number
}

export class ElRawType
{
  static isMatch(dataType:ElRawType, value:number|string|object):boolean
  {
    if(typeof(value) === "string")
    {
      return true;
    }
    else
    {
      return false;
    }
  }
}

export interface ElBitmapType{
  type: "bitmap";
  size: number;
  bitmaps: {
    name: string;
    descriptions: {
      ja: string;
      en: string;
    },
    position: {
      index: number;
      bitMask: string;
    };
    value: ElDataType;
  }[]
}

export class ElBitmapType
{
  static isMatch(dataType:ElBitmapType, value:number|string|object):boolean
  {
    if(typeof(value) !== "object")
    {
      return false;
    }
    for(const prop of dataType.bitmaps)
    {
      if((prop.name in value)===false)
      {
        return false;
      }
      if(isMatchToElDataType(prop.value, (value as any)[prop.name])===false)
      {
        return false;
      }
    }

    return true;
  }
}

export interface ElTimeType{
  type:"time";
  size?: number;  // default 3
  maximumOfHour?: number;  // default 23
}

export class ElTimeType
{
  static isMatch(dataType:ElTimeType, value:number|string|object):boolean
  {
    if(typeof(value) !== "string")
    {
      return false;
    }
    if(dataType.size === undefined || dataType.size === 3)
    {
      if(value.match(/[0-9]{2}:[0-9]{2}:[0-9]{2}/) !== null)
      {
        return true;
      }
    }
    if(dataType.size !== undefined || dataType.size === 2)
    {
      if(value.match(/[0-9]{2}:[0-9]{2}/) !== null)
      {
        return true;
      }
    }
    return false;
  }
}


export interface ElDateTimeType{
  type:"date-time";
  size?: number;  // default 7
}
export class ElDateTimeType
{
  static isMatch(dataType:ElDateTimeType, value:number|string|object):boolean
  {
    if(typeof(value) !== "string")
    {
      return false;
    }
    if(dataType.size === undefined || dataType.size === 7)
    {
      if(value.match(/[0-9]{4}\-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}/) !== null)
      {
        return true;
      }  
    }
    if(dataType.size !== undefined && dataType.size === 6)
    {
      if(value.match(/[0-9]{4}\-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}/) !== null)
      {
        return true;
      }
    }
    if(dataType.size !== undefined && dataType.size === 5)
    {
      if(value.match(/[0-9]{4}\-[0-9]{2}-[0-9]{2} [0-9]{2}/) !== null)
      {
        return true;
      }
    }
    return false;
  }
}



export interface ElDateType{
  type:"date";
  size?: number;  // default 4
}
export class ElDateType
{
  static isMatch(dataType:ElDateType, value:number|string|object):boolean
  {
    if(typeof(value) !== "string")
    {
      return false;
    }
    if(dataType.size === undefined || dataType.size === 4)
    {
      if(value.match(/[0-9]{4}\-[0-9]{2}\-[0-9]{2}/) !== null)
      {
        return true;
      }
    }
    if(dataType.size !== undefined && dataType.size === 3)
    {
      if(value.match(/[0-9]{4}\-[0-9]{2}/) !== null)
      {
        return true;
      }
    }
    if(dataType.size !== undefined && dataType.size === 2)
    {
      if(value.match(/[0-9]{4}/) !== null)
      {
        return true;
      }
    }
    return false;
  }
}


export interface ElLevelType{
  type: "level";
  base: string;
  maximum: number;
  descriptions?:{
    ja: string;
    en: string;
  }
}
export class ElLevelType
{
  static isMatch(dataType:ElLevelType, value:number|string|object):boolean
  {
    if(typeof(value) !== "number")
    {
      return false;
    }
    if(value<dataType.maximum)
    {
      return true;
    }
    else
    {
      return false;
    }
  }
}


export interface ElNumericValueType{
  type: "numericValue";
  size: number;
  enum: 
  {
    edt: string;
    numericValue: number;
  }[];
}
export class ElNumericValueType
{
  static isMatch(dataType:ElNumericValueType, value:number|string|object):boolean
  {
    if(typeof(value) !== "number")
    {
      return false;
    }
    if(dataType.enum.findIndex(_=>_.numericValue === value) !== -1)
    {
      return true;
    }
    else
    {
      return false;
    }
  }
}

export interface ElStateType{
  type: "state";
  size: number;
  enum: {
      edt: string;
      name: string;
      descriptions: {
        ja: string;
        en: string;
      };
      readOnly?:boolean;
    }[];
}
export class ElStateType
{
  static isMatch(dataType:ElStateType, value:number|string|object):boolean
  {
    if(typeof(value) !== "string")
    {
      return false;
    }
    if(dataType.enum.findIndex(_=>_.name === value) !== -1)
    {
      return true;
    }
    else
    {
      return false;
    }
  }
}
export interface ElNumberType{
  type: "number";
  format: "int8"|"int16"|"int32"|"uint8"|"uint16"|"uint32";
  unit?: string;
  minimum?: number;
  maximum?: number;
  enum?: number[];
  multiple?: number;
  multipleOf?: number;
  coefficient?: string[]; //無視する。プログラムからは使えない
  overflowCode?: boolean;
  underflowCode?: boolean;
  descriptions?: {
    ja: string;
    en: string;
  }
}
export class ElNumberType
{
  static isMatch(dataType:ElNumberType, value:number|string|object):boolean
  {
    if(typeof(value) !== "number")
    {
      return false;
    }
    if(dataType.enum !== undefined)
    {
      if(dataType.enum.indexOf(value) !== -1)
      {
        return true;
      }
      else
      {
        return false;
      }
    }
    if(dataType.maximum!==undefined)
    {
      if(value > dataType.maximum)
      {
        return false;
      }
    }
    if(dataType.minimum!==undefined)
    {
      if(value < dataType.minimum)
      {
        return false;
      }
    }
    return true;
  }
}
export type ElDataType = ElNumberType|ElStateType|ElNumericValueType|ElLevelType|ElDateType|ElDateTimeType|ElTimeType|ElBitmapType|ElRawType|ElArrayType|ElObjectType|ElMixedOneOfType|ElRefType;



export interface ElPropertyDescription
{
  epc: string;
  validRelease: {
    from: string;
    to: string;
  };
  propertyName: {
    ja: string;
    en: string;
  };
  shortName:string;
  accessRule: {
    get: "required"|"optional"|"notApplicable";
    set: "required"|"optional"|"notApplicable";
    inf: "required"|"optional";
  };
  descriptions?: {
    ja: string;
    en: string;
  };
  atomic?: string;
  data: ElDataType;
  remark?: {
    ja: string;
    en: string;
  };
  note?: {
    ja: string;
    en: string;
  };
}

export interface ElDeviceDescription
{
  eoj:string;
  validRelease: {
    from: string;
    to: string;
  };
  className: {
    ja: string;
    en: string;
  };
  shortName:string;
  elProperties: ElPropertyDescription[]
}

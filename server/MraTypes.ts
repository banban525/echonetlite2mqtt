export interface ElDefinitions{
  definitions:{[key:string]:ElDataType};
}

export interface ElRefType{
  "$ref":string;
}

export interface ElMixedOneOfType{
  oneOf:ElDataType[];
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

export interface ElArrayType{
  type:"array";
  itemSize: number;
  minItems?: number;
  maxItems: number;
  items: ElDataType;
}

export interface ElRawType{
  type:"raw",
  minSize:number,
  maxSize:number
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
      bitMask: number;
    };
    value: ElDataType;
  }[]
}

export interface ElTimeType{
  type:"time";
  size?: number;  // default 3
  maximumOfHour?: number;  // default 23
}

export interface ElDateTimeType{
  type:"date-time";
  size?: number;  // default 7
}


export interface ElDateType{
  type:"date";
  size?: number;  // default 4
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

export interface ElNumericValueType{
  type: "numericValue";
  size: number;
  enum: 
  {
    edt: string;
    numericValue: number;
  }[];
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

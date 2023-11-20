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
  /** array of element - 要素の列挙 */
  properties: {
    /** element name - 要素名 */
    elementName: {
      /** element name in Japanese - 要素名（日本語） */
      ja: string;
      /** element name in English - 要素名（英語） */
      en: string;
    };
    /** short name of the element name - 要素の short name */
    shortName: string;
    /** data type object of the element - 要素のデータタイプオブジェクト */
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
  /** data size of each item - 項目のデータサイズ */
  itemSize: number;
  /** minimum number of items - 項目の最小数 */
  minItems?: number;
  /** maximum number of items - 項目の最大数 */
  maxItems: number;
  /** data type object - 項目のデータタイプオブジェクト */
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
  /** minimum data size - データサイズの最小値 */
  minSize:number,
  /** maximum data size  - データサイズの最大値 */
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
  /** size of total bitmaps data in bytes - 全体のデータサイズ（バイト数）を示す。 */
  size: number;
  /** array of bitmap object - bitmap object の列挙 */
  bitmaps: {
    /** bitmap name - bitmap 名*/
    name: string;
    /** descriptions of bitmap - bitmap の説明 */
    descriptions: {
      /** description in Japanese - bitmap の説明（日本語） */
      ja: string;
      /** description in English - bitmap の説明（英語）*/
      en: string;
    },
    /** position of bitmap - bitmap の位置 */
    position: {
      /** index of byte-data - 何バイト目かを示す */
      index: number;
      /** bitmask to specify bits - 該当するバイトの中のbitmapの１を示す */
      bitMask: string;
    };
    /** data type object of the bitmap value - bitmapで表現する値のデータタイプオブジェクト */
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
  /** Data size in case of partial data - データサイズ（バイト数）を示す。
   * @default 3
   */
  size?: number;
  /** Specifies maximum value of hour. - Hour の最大値を設定する。 
   * @default 23
  */
  maximumOfHour?: number;
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
  /** Data size in case of partial data - データサイズ（バイト数）を示す。
   * @default 7
   */
  size?: number;
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
  /** Data size in case of partial data - データサイズ（バイト数）を示す。 
   * @default 4
  */
  size?: number;
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
  /** EDT value in Hex that is associated to LEVEL_1  - レベル 1 に対応する EDT 値の16進数表記 (string) の EDT値 
   * @pattern ^0x[0-9A-F]+$
  */
  base: string;
  /** maximum level  - レベルの最大値 */
  maximum: number;
  /** descriptions of the level - レベルの説明 */
  descriptions?:{
    /** description in Japanese - レベルの説明（日本語） */
    ja: string;
    /** description in English - レベルの説明（英語） */
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
  /** data size. 0 in case of bitmap  - データサイズ（バイト数）を示す。bitmap の場合は 0 とする。 */
  size: number;
  /** array of numericValue object  - numericValue object を列挙する */
  enum: 
  {
    /** EDT value in Hex - 16進数表記 (string) の EDT 値
     * @pattern ^0x[0-9A-F]+$
     */
    edt: string;
    /** numeric value - 数値 */
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
  /** data size. 0 in case of bitmap - データサイズ（バイト数）を示す。bitmap の場合は 0 とする。 */
  size: number;
  /** array of state object - state object を列挙する */
  enum: {
      /** EDT value in Hex - 16進数表記 (string) の EDT 値
       * @pattern ^0x[0-9A-F]+$
       */
      edt: string;
      /** a name of the state - 状態の名前 */
      name: string;
      /** descriptions of the state - 状態の説明 */
      descriptions: {
        /** description in Japanese - 状態の説明（日本語） */
        ja: string;
        /** description in English - 状態の説明（英語） */
        en: string;
      };
      /** read only flag. 
       * @default false
       * @description
       *   "readOnly" is set to "true" when it is utilized for the response of Get but not utilized for the response of Set.
       *   For example, Chamber temperature setting (0xE3) of electronic oven (0x03B8), "0x8002: Not specified". 
       *   When access rules of property are GET only, "readOnly" should not be used. 
       *   Get のレスポンスとしては利用されるが、Set の値としては利用できない場合に readOnly を true にする。
       *   例：オーブンレンジ (0x03B8) の庫内温度設定値 (0xE3) におけるプロパティ値, 0x8002: 未設定"。
       *   なお、アクセスルールが Get のみのプロパティでは、readOnly を利用しない。
       */
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
  /** unit - 単位 */
  unit?: string;
  /** minimum number */
  minimum?: number;
  /** maximum number */
  maximum?: number;
  /** restricting values by enumeration  - 特定の値のみ利用する場合は、値を列挙する */
  enum?: number[];
  /** multiple value - 係数 */
  multiple?: number;
  /** step - 数値データのステップ */
  multipleOf?: number;
  /** EPCs for coefficient in Hex(string)  - 係数として使用する EPCs (16進数表記 string) */
  coefficient?: string[]; //無視する。プログラムからは使えない
  /** flag to utilize overflow code. default is true. - overflow code 利用のflag. 
   * @default true
   */
  overflowCode?: boolean;
  /** flag to utilize underflow code. default is true. - underflow code 利用のflag. 
   * @default true
   */
  underflowCode?: boolean;
  /** descriptions */
  descriptions?: {
    /** description in Japanese */
    ja: string;
    /** description in English */
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
  /** EPC in Hex expression - EPCコードを16進数表記したもの
   * @pattern ^0x[0-9A-F]{2}$
   */
  epc: string;
  /** range of valid release of Appendix - property の記述が有効なAppendixのリリースバージョンの範囲 */
  validRelease: {
    /** beginning of the range - 有効範囲の始まりのAppendix */
    from: string;
    /** end of the range - 有効範囲の終わりのAppendix */
    to: string;
  };
  /** property name defined in Appendix - Appendix で定義された プロパティ名とproperty name */
  propertyName: {
    /** property name in Japanese - プロパティ名：日本語 */
    ja: string;
    /** property name in English - プロパティ名：英語 */
    en: string;
  };
  /** short name of the property name - property name の short name */
  shortName:string;
  /** access rule */
  accessRule: {
    /** Get access rule - Get の実装 */
    get: "required"|"optional"|"notApplicable";
    /** Set access rule - Set の実装 */
    set: "required"|"optional"|"notApplicable";
    /** Anno access rule - 状変時アナウンスの実装 */
    inf: "required"|"optional";
  };
  /** contents of property defined in Appendix - Appendix に記述された プロパティ内容とcontents of property */
  descriptions?: {
    /** description in Japanese - プロパティの説明：日本語 */
    ja: string;
    /** description in English - プロパティの説明：英語 */
    en: string;
  };
  /** EPC in HEX that requires atomic operation(SET) befor GET  - atomic operation が必要な場合のプロパティ */
  atomic?: string;
  /** data type of the property value - プロパティの値のデータタイプ */
  data: ElDataType;
  /** remark defined in Appendix - 備考および参考情報 */
  remark?: {
    /** remark in Japanese - 備考および参考情報：日本語 */
    ja: string;
    /** remark in English - 備考および参考情報：英語 */
    en: string;
  };
  /** additional information for Device Description of ECHONET Lite Web API - Device Description用の参考情報 */
  note?: {
    /** note in Japanese - Device Description用の参考情報：日本語 */
    ja: string;
    /** note in English  - Device Description用の参考情報：英語 */
    en: string;
  };
}

export interface ElDeviceDescription
{
  /** upper two bytes of EOJ in Hex expression - EOJコードの上位２バイトを16進数表記したもの 
   * @example 0x0130
   * @pattern ^0x[0-9A-F]{4}$
  */
  eoj:string;
  /** range of valid release of APPENDIX - 機器オブジェクト定義が有効なAppendixのバージョンの範囲 */
  validRelease: {
    /** beginning of the range - 有効範囲の始まりのAppendixバージョン */
    from: string;
    /** end of the range - 有効範囲の終わりのAppendixバージョン */
    to: string;
  };
  /** class name defined in Appendix - クラス名 */
  className: {
    /** class name defined in Appendix in Japanese - クラス名：日本語 */
    ja: string;
    /** class name defined in Appendix in English - クラス名：英語 */
    en: string;
  };
  /** short name of the class name - クラス名のショートネーム */
  shortName:string;
  /** a collection of property description object - property description object を要素とした配列 */
  elProperties: ElPropertyDescription[]
}

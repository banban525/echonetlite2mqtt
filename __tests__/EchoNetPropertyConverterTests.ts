import 'jest';

import {EchoNetPropertyConverter} from "../server/EchoNetPropertyConverter";
import { ElArrayType, ElBitmapType, ElDataType, ElDateTimeType, ElDateType, ElLevelType, ElNumberType, ElNumericValueType, ElObjectType, ElRawType, ElStateType, ElTimeType } from '../server/MraTypes';

const converter = new EchoNetPropertyConverter([]);


test('convert data for ElStateType', () => {
  const stateType:ElStateType = {
    "type": "state",
    "size": 1,
    "enum": [
      {
        "edt": "0x40",
        "name": "false",
        "descriptions": {
          "ja": "OFF",
          "en": "OFF"
        }
      },
      {
        "edt": "0x41",
        "name": "true",
        "descriptions": {
          "ja": "ON",
          "en": "ON"
        }
      }
    ]
  };
  expect(converter.toObject(stateType, "40")).toBe('false');
  expect(converter.toObject(stateType, "41")).toBe('true');
  expect(converter.toObject(stateType, "")).toBeUndefined();
  expect(converter.toObject(stateType, "4")).toBeUndefined();
  expect(converter.toObject(stateType, "00")).toBeUndefined();
  expect(converter.toObject(stateType, "4000")).toBeUndefined();

  expect(converter.toEchoNetLiteData(stateType, "false")).toBe('40');
  expect(converter.toEchoNetLiteData(stateType, "true")).toBe('41');
  expect(converter.toEchoNetLiteData(stateType, false)).toBeUndefined();
  expect(converter.toEchoNetLiteData(stateType, true)).toBeUndefined();
  expect(converter.toEchoNetLiteData(stateType, "FALSE")).toBeUndefined();
  expect(converter.toEchoNetLiteData(stateType, "TRUE")).toBeUndefined();
  expect(converter.toEchoNetLiteData(stateType, "")).toBeUndefined();
  expect(converter.toEchoNetLiteData(stateType, undefined)).toBeUndefined();

});


test('convert data for ElNumericValueType', () => {
  const numericValueType:ElNumericValueType = {
    "type": "numericValue",
    "size": 1,
    "enum": [
      {
        "edt": "0x00",
        "numericValue": 1
      },
      {
        "edt": "0x01",
        "numericValue": 0.1
      },
      {
        "edt": "0x02",
        "numericValue": 0.01
      },
      {
        "edt": "0x03",
        "numericValue": 0.001
      }
    ]
  };
  expect(converter.toObject(numericValueType, "00")).toBe(1);
  expect(converter.toObject(numericValueType, "01")).toBe(0.1);
  expect(converter.toObject(numericValueType, "02")).toBe(0.01);
  expect(converter.toObject(numericValueType, "03")).toBe(0.001);

  expect(converter.toObject(numericValueType, "04")).toBeUndefined();
  expect(converter.toObject(numericValueType, "0000")).toBeUndefined();
  expect(converter.toObject(numericValueType, "")).toBeUndefined();


  expect(converter.toEchoNetLiteData(numericValueType, 1)).toBe("00");
  expect(converter.toEchoNetLiteData(numericValueType, 0.1)).toBe("01");
  expect(converter.toEchoNetLiteData(numericValueType, 0.01)).toBe("02");
  expect(converter.toEchoNetLiteData(numericValueType, 0.001)).toBe("03");

  expect(converter.toEchoNetLiteData(numericValueType, 2)).toBeUndefined();
  expect(converter.toEchoNetLiteData(numericValueType, undefined)).toBeUndefined();
  expect(converter.toEchoNetLiteData(numericValueType, "0.1")).toBeUndefined();

});



test('convert data for ElDateType', () => {
  const dateTypeSize4:ElDateType = {
    type: "date",
    size: 4
  };
  expect(converter.toObject(dateTypeSize4, "07e6" + "0b" + "1e")).toBe('2022-11-30');
  expect(converter.toObject(dateTypeSize4, "07e6" + "01" + "01")).toBe('2022-01-01');
  expect(converter.toEchoNetLiteData(dateTypeSize4, "2022-11-30")).toBe("07e6" + "0b" + "1e");

  expect(converter.toObject(dateTypeSize4, "07e6" + "0d" + "01")).toBeUndefined();  //2022-13-01
  expect(converter.toObject(dateTypeSize4, "07e6" + "02" + "1e")).toBeUndefined();  //2022-02-30
  

  const dateTypeSize3:ElDateType = {
    type: "date",
    size: 3
  };
  expect(converter.toObject(dateTypeSize3, "07e6" + "0b")).toBe('2022-11');
  expect(converter.toEchoNetLiteData(dateTypeSize3, "2022-11")).toBe("07e6" + "0b");
  expect(converter.toEchoNetLiteData(dateTypeSize3, "2022-11-30")).toBeUndefined();

  const dateTypeSize2:ElDateType = {
    type: "date",
    size: 2
  };
  expect(converter.toObject(dateTypeSize2, "07e6")).toBe('2022');
  expect(converter.toEchoNetLiteData(dateTypeSize2, "2022")).toBe("07e6");
  expect(converter.toEchoNetLiteData(dateTypeSize2, "2022-11")).toBeUndefined();
  expect(converter.toEchoNetLiteData(dateTypeSize2, "2022-11-30")).toBeUndefined();
});


test('convert data for ElTimeType', () => {
  const timeTypeSize3:ElTimeType = {
    type: "time",
    size: 3
  };
  expect(converter.toObject(timeTypeSize3, "00" + "01" + "02")).toBe('00:01:02');
  expect(converter.toObject(timeTypeSize3, "17" + "3b" + "3a")).toBe('23:59:58');
  expect(converter.toObject(timeTypeSize3, "00" + "00" + "3c")).toBeUndefined();
  expect(converter.toObject(timeTypeSize3, "00" + "3c" + "00")).toBeUndefined();
  expect(converter.toObject(timeTypeSize3, "18" + "00" + "00")).toBeUndefined();
  expect(converter.toEchoNetLiteData(timeTypeSize3, "00:01:02")).toBe("00" + "01" + "02");
  expect(converter.toEchoNetLiteData(timeTypeSize3, "00:00")).toBeUndefined();
  expect(converter.toEchoNetLiteData(timeTypeSize3, "00")).toBeUndefined();
  expect(converter.toEchoNetLiteData(timeTypeSize3, "00:01:02:00")).toBeUndefined();
  expect(converter.toEchoNetLiteData(timeTypeSize3, "00:01:60")).toBeUndefined();
  expect(converter.toEchoNetLiteData(timeTypeSize3, "00:60:02")).toBeUndefined();
  expect(converter.toEchoNetLiteData(timeTypeSize3, "24:01:02")).toBeUndefined();
  expect(converter.toEchoNetLiteData(timeTypeSize3, "")).toBeUndefined();
  expect(converter.toEchoNetLiteData(timeTypeSize3, undefined)).toBeUndefined();

  const timeTypeSize2:ElTimeType = {
    type: "time",
    size: 2
  };
  expect(converter.toObject(timeTypeSize2, "00" + "01")).toBe('00:01');
  expect(converter.toObject(timeTypeSize2, "18" + "00" )).toBeUndefined();
  expect(converter.toObject(timeTypeSize2, "00" + "00" + "00")).toBeUndefined();
  expect(converter.toEchoNetLiteData(timeTypeSize2, "00:01")).toBe("00" + "01");
  expect(converter.toEchoNetLiteData(timeTypeSize2, "00")).toBeUndefined();
  expect(converter.toEchoNetLiteData(timeTypeSize2, "00:01:02")).toBeUndefined();

  const timeTypeSize1:ElTimeType = {
    type: "time",
    size: 1
  };
  expect(converter.toObject(timeTypeSize1, "00")).toBe('00');
  expect(converter.toObject(timeTypeSize1, "18")).toBeUndefined();
  expect(converter.toObject(timeTypeSize1, "00" + "00")).toBeUndefined();
  expect(converter.toEchoNetLiteData(timeTypeSize1, "23")).toBe("17");
  expect(converter.toEchoNetLiteData(timeTypeSize1, "00:00")).toBeUndefined();

});

test('convert data for ElDateTimeType', () => {
  const dateTimeTypeSize7:ElDateTimeType = {
    type: "date-time",
    size: 7
  };

  expect(converter.toObject(dateTimeTypeSize7, "07e6" + "01" + "02" + "00" + "01" + "02")).toBe('2022-01-02 00:01:02');
  expect(converter.toObject(dateTimeTypeSize7, "07e6" + "0b" + "1e" + "17" + "3b" + "3a")).toBe('2022-11-30 23:59:58');
  expect(converter.toObject(dateTimeTypeSize7, "07e6" + "0d" + "01" + "00" + "01" + "02")).toBeUndefined();  //2022-13-01 00:01:02
  expect(converter.toObject(dateTimeTypeSize7, "07e6" + "02" + "1e" + "00" + "01" + "02")).toBeUndefined();  //2022-02-30 00:01:02
  expect(converter.toObject(dateTimeTypeSize7, "07e6" + "01" + "02" + "00" + "00" + "3c")).toBeUndefined();  //2022-01-02 00:00:60
  expect(converter.toObject(dateTimeTypeSize7, "07e6" + "01" + "02" + "00" + "3c" + "00")).toBeUndefined();  //2022-01-02 00:60:00
  expect(converter.toObject(dateTimeTypeSize7, "07e6" + "01" + "02" + "18" + "00" + "00")).toBeUndefined();  //2022-01-02 24:00:00
  expect(converter.toObject(dateTimeTypeSize7, "07e6" + "01" + "02" + "00" + "01")).toBeUndefined(); 
  expect(converter.toObject(dateTimeTypeSize7, "07e6" + "01" + "02" + "00" + "01" + "00" + "00")).toBeUndefined(); 

  expect(converter.toEchoNetLiteData(dateTimeTypeSize7, '2022-01-02 00:01:02')).toBe("07e6" + "01" + "02" + "00" + "01" + "02");
  expect(converter.toEchoNetLiteData(dateTimeTypeSize7, '2022-13-01 00:01:02')).toBeUndefined();
  expect(converter.toEchoNetLiteData(dateTimeTypeSize7, '2022-02-30 00:01:02')).toBeUndefined();
  expect(converter.toEchoNetLiteData(dateTimeTypeSize7, '2022-01-02 00:00:60')).toBeUndefined();
  expect(converter.toEchoNetLiteData(dateTimeTypeSize7, '2022-01-02 00:60:00')).toBeUndefined();
  expect(converter.toEchoNetLiteData(dateTimeTypeSize7, '2022-01-02 24:00:00')).toBeUndefined();
  expect(converter.toEchoNetLiteData(dateTimeTypeSize7, '2022-01-02 00:00')).toBeUndefined();
  expect(converter.toEchoNetLiteData(dateTimeTypeSize7, undefined)).toBeUndefined();
  expect(converter.toEchoNetLiteData(dateTimeTypeSize7, 2022)).toBeUndefined();

  const dateTimeTypeSize6:ElDateTimeType = {
    type: "date-time",
    size: 6
  };
  expect(converter.toObject(dateTimeTypeSize6, "07e6" + "01" + "02" + "00" + "01")).toBe('2022-01-02 00:01');
  expect(converter.toObject(dateTimeTypeSize6, "07e6" + "01" + "02" + "00" + "01" + "00")).toBeUndefined(); 
  expect(converter.toObject(dateTimeTypeSize6, "07e6" + "01" + "02" + "00")).toBeUndefined(); 

  expect(converter.toEchoNetLiteData(dateTimeTypeSize6, '2022-01-02 00:01')).toBe("07e6" + "01" + "02" + "00" + "01");
  expect(converter.toEchoNetLiteData(dateTimeTypeSize6, '2022-01-02 00:01:02')).toBeUndefined(); 
  expect(converter.toEchoNetLiteData(dateTimeTypeSize6, '2022-01-02 00')).toBeUndefined(); 

  const dateTimeTypeSize5:ElDateTimeType = {
    type: "date-time",
    size: 5
  };
  expect(converter.toObject(dateTimeTypeSize5, "07e6" + "01" + "02" + "00")).toBe('2022-01-02 00');
  expect(converter.toObject(dateTimeTypeSize5, "07e6" + "01" + "02" + "00" + "01")).toBeUndefined(); 
  expect(converter.toObject(dateTimeTypeSize5, "07e6" + "01" + "02")).toBeUndefined(); 

  expect(converter.toEchoNetLiteData(dateTimeTypeSize5, '2022-01-02 00')).toBe("07e6" + "01" + "02" + "00");
  expect(converter.toEchoNetLiteData(dateTimeTypeSize5, '2022-01-02 00:01')).toBeUndefined(); 
  expect(converter.toEchoNetLiteData(dateTimeTypeSize5, '2022-01-02')).toBeUndefined(); 

});



test('convert data for ElLevelType', () => {
  const levelType:ElLevelType = {
    "type": "level",
    "base": "0x31",
    "maximum": 3
  };

  expect(converter.toObject(levelType, "30")).toBeUndefined();
  expect(converter.toObject(levelType, "31")).toBe(1);
  expect(converter.toObject(levelType, "32")).toBe(2);
  expect(converter.toObject(levelType, "33")).toBe(3);
  expect(converter.toObject(levelType, "34")).toBeUndefined();
  expect(converter.toObject(levelType, "3100")).toBeUndefined();

  expect(converter.toEchoNetLiteData(levelType, 0)).toBeUndefined();
  expect(converter.toEchoNetLiteData(levelType, 1)).toBe("31");
  expect(converter.toEchoNetLiteData(levelType, 2)).toBe("32");
  expect(converter.toEchoNetLiteData(levelType, 3)).toBe("33");
  expect(converter.toEchoNetLiteData(levelType, 4)).toBeUndefined();
  expect(converter.toEchoNetLiteData(levelType, "1")).toBeUndefined();
  expect(converter.toEchoNetLiteData(levelType, undefined)).toBeUndefined();
});


test('convert data for ElNumberType', () => {
  {
    const numberType:ElNumberType = {
      "type": "number",
      "format": "uint16",
      "minimum": 0,
      "maximum": 60000,
      "unit": "m3/h",
      "multiple": 0.001
    };

    expect(converter.toObject(numberType, "0000")).toBe(0);
    expect(converter.toObject(numberType, "0001")).toBe(0.001);
    expect(converter.toObject(numberType, "ea60")).toBe(60);
    expect(converter.toObject(numberType, "ea61")).toBeUndefined();
    expect(converter.toObject(numberType, "000000")).toBeUndefined();
    expect(converter.toObject(numberType, "00")).toBeUndefined();

    expect(converter.toEchoNetLiteData(numberType, 0)).toBe("0000");
    expect(converter.toEchoNetLiteData(numberType, 0.001)).toBe("0001");
    expect(converter.toEchoNetLiteData(numberType, 60)).toBe("ea60");
    expect(converter.toEchoNetLiteData(numberType, 60.001)).toBeUndefined();
    expect(converter.toEchoNetLiteData(numberType, "0")).toBeUndefined();
    expect(converter.toEchoNetLiteData(numberType, undefined)).toBeUndefined();

    expect(converter.toObject(numberType, "fffe")).toBe("underflow");
    expect(converter.toObject(numberType, "ffff")).toBe("overflow");
    expect(converter.toEchoNetLiteData(numberType, "underflow")).toBe("fffe");
    expect(converter.toEchoNetLiteData(numberType, "overflow")).toBe("ffff");

  }

  {
    const numberType:ElNumberType = {
      "type": "number",
      "format": "uint8",
      "enum": [
        1,
        20,
        21
      ]
    };

    expect(converter.toObject(numberType, "00")).toBeUndefined();
    expect(converter.toObject(numberType, "01")).toBe(1);
    expect(converter.toObject(numberType, "02")).toBeUndefined();
    expect(converter.toObject(numberType, "13")).toBeUndefined();
    expect(converter.toObject(numberType, "14")).toBe(20);
    expect(converter.toObject(numberType, "15")).toBe(21);
    expect(converter.toObject(numberType, "16")).toBeUndefined();

    expect(converter.toObject(numberType, "0100")).toBeUndefined();

    expect(converter.toEchoNetLiteData(numberType, 0)).toBeUndefined();
    expect(converter.toEchoNetLiteData(numberType, 1)).toBe("01");
    expect(converter.toEchoNetLiteData(numberType, 2)).toBeUndefined();
    expect(converter.toEchoNetLiteData(numberType, 13)).toBeUndefined();
    expect(converter.toEchoNetLiteData(numberType, 20)).toBe("14");
    expect(converter.toEchoNetLiteData(numberType, 21)).toBe("15");
    expect(converter.toEchoNetLiteData(numberType, 22)).toBeUndefined();
    expect(converter.toEchoNetLiteData(numberType, "1")).toBeUndefined();
    expect(converter.toEchoNetLiteData(numberType, undefined)).toBeUndefined();

    expect(converter.toObject(numberType, "fe")).toBe("underflow");
    expect(converter.toObject(numberType, "ff")).toBe("overflow");
    expect(converter.toEchoNetLiteData(numberType, "underflow")).toBe("fe");
    expect(converter.toEchoNetLiteData(numberType, "overflow")).toBe("ff");
 }


  {
    const numberType:ElNumberType = {
      "type": "number",
      "format": "int16",
      "minimum": -30000,
      "maximum": 30000,
      "unit": "A",
      "multipleOf": 0.1
    };

    expect(converter.toObject(numberType, "8acf")).toBeUndefined();
    expect(converter.toObject(numberType, "8ad0")).toBe(-3000.0);
    expect(converter.toObject(numberType, "0000")).toBe(0);
    expect(converter.toObject(numberType, "0001")).toBe(0.1);
    expect(converter.toObject(numberType, "7530")).toBe(3000.0);
    expect(converter.toObject(numberType, "7531")).toBeUndefined();

    expect(converter.toEchoNetLiteData(numberType, -3000.1)).toBeUndefined();
    expect(converter.toEchoNetLiteData(numberType, -3000)).toBe("8ad0");
    expect(converter.toEchoNetLiteData(numberType, 0)).toBe("0000");
    expect(converter.toEchoNetLiteData(numberType, 0.1)).toBe("0001");
    expect(converter.toEchoNetLiteData(numberType, 3000)).toBe("7530");
    expect(converter.toEchoNetLiteData(numberType, 3000.1)).toBeUndefined();

    
    expect(converter.toObject(numberType, "8000")).toBe("underflow");
    expect(converter.toObject(numberType, "7fff")).toBe("overflow");
    expect(converter.toEchoNetLiteData(numberType, "underflow")).toBe("8000");
    expect(converter.toEchoNetLiteData(numberType, "overflow")).toBe("7fff");
  }


  {
    const numberType:ElNumberType = {
      "type": "number",
      "format": "int32",
      "minimum": -999999999,
      "maximum": -1,
      "unit": "Wh"
    };

    expect(converter.toObject(numberType, "c4653600")).toBeUndefined();
    expect(converter.toObject(numberType, "c4653601")).toBe(-999999999);
    expect(converter.toObject(numberType, "ffffffff")).toBe(-1);
    expect(converter.toObject(numberType, "00000000")).toBeUndefined();

    expect(converter.toEchoNetLiteData(numberType, -1000000000)).toBeUndefined();
    expect(converter.toEchoNetLiteData(numberType, -999999999)).toBe("c4653601");
    expect(converter.toEchoNetLiteData(numberType, -1)).toBe("ffffffff");
    expect(converter.toEchoNetLiteData(numberType, 0)).toBeUndefined();
    

    expect(converter.toObject(numberType, "80000000")).toBe("underflow");
    expect(converter.toObject(numberType, "7fffffff")).toBe("overflow");
    expect(converter.toEchoNetLiteData(numberType, "underflow")).toBe("80000000");
    expect(converter.toEchoNetLiteData(numberType, "overflow")).toBe("7fffffff");
  }

  {
    const numberType:ElNumberType = {
      "type": "number",
      "format": "uint32",
      "unit": "kWh",
      "coefficient": [
        "0xC2"
      ],
      "overflowCode": false,
      "underflowCode": false
    };

    expect(converter.toObject(numberType, "fffffffe")).toBe(4294967294);
    expect(converter.toObject(numberType, "ffffffff")).toBe(4294967295);

    expect(converter.toEchoNetLiteData(numberType, 4294967294)).toBe("fffffffe");
    expect(converter.toEchoNetLiteData(numberType, 4294967295)).toBe("ffffffff");
  }

  {
    const numberType:ElNumberType =  {
      "type": "number",
      "format": "int32",
      "unit": "mA",
      overflowCode: false,
      underflowCode: false
    };

    expect(converter.toObject(numberType, "80000000")).toBe(-2147483648);
    expect(converter.toObject(numberType, "7fffffff")).toBe(2147483647);

    expect(converter.toEchoNetLiteData(numberType, -2147483648)).toBe("80000000");
    expect(converter.toEchoNetLiteData(numberType, 2147483647)).toBe("7fffffff");
  }
});


test('convert data for ElRawType', () => {

  const rawType:ElRawType =  {
    "type": "raw",
    "minSize": 1,
    "maxSize": 12
  };

  expect(converter.toObject(rawType, "")).toBeUndefined();
  expect(converter.toObject(rawType, "01")).toBe("01");
  expect(converter.toObject(rawType, "000102030405060708090a0b")).toBe("000102030405060708090a0b");
  expect(converter.toObject(rawType, "000102030405060708090a0b0c")).toBeUndefined();

  expect(converter.toEchoNetLiteData(rawType, "")).toBeUndefined();
  expect(converter.toEchoNetLiteData(rawType, "01")).toBe("01");
  expect(converter.toEchoNetLiteData(rawType, "000102030405060708090a0b")).toBe("000102030405060708090a0b");
  expect(converter.toEchoNetLiteData(rawType, "000102030405060708090a0b0c")).toBeUndefined();

});

test('convert data for ElObjectType', ()=>{
  const objectType: ElObjectType = {
    "type": "object",
    "properties": [
      {
        "elementName": {
          "ja": "1Byte目:照明の明るさ",
          "en": "Byte 1: light level"
        },
        "shortName": "lightLevel",
        "element": {
          "oneOf": [
            {
              "type": "number",
              "format": "uint8",
              "minimum": 1,
              "maximum": 255
            },
            {
              "type": "state",
              "size": 1,
              "enum": [
                {
                  "edt": "0x00",
                  "name": "notLightLevel",
                  "descriptions": {
                    "ja": "機能を搭載していない場合",
                    "en": "When the function is not implemented."
                  }
                }
              ]
            }
          ]
        }
      },
      {
        "elementName": {
          "ja": "2Byte目:光色",
          "en": "Byte 2: light color"
        },
        "shortName": "color",
        "element": {
          "oneOf": [
            {
              "type": "number",
              "format": "uint8",
              "minimum": 1,
              "maximum": 255
            },
            {
              "type": "state",
              "size": 1,
              "enum": [
                {
                  "edt": "0x00",
                  "name": "notColor",
                  "descriptions": {
                    "ja": "機能を搭載していない場合",
                    "en": "When the function is not implemented."
                  }
                }
              ]
            }
          ]
        }
      }
    ]
  };

  expect(converter.toObject(objectType, "0000")).toStrictEqual({
    lightLevel: "notLightLevel",
    color: "notColor"
  });
  expect(converter.toObject(objectType, "fd01")).toStrictEqual({
    lightLevel: 253,
    color: 1
  });

  expect(converter.toEchoNetLiteData(objectType, {
    lightLevel: "notLightLevel",
    color: "notColor"
  })).toBe("0000");
  expect(converter.toEchoNetLiteData(objectType, {
    lightLevel: 253,
    color: 1
  })).toBe("fd01");

  

});



test('convert data for ElBitmapType', ()=>{
  const bitmapType: ElBitmapType = {
    "type": "bitmap",
    "size": 8,
    "bitmaps": [
      {
        "name": "levelOfElectronic",
        "descriptions": {
          "ja": "電気集塵方式：制御レベル",
          "en": "Electronic dust collection:Level"
        },
        "position": {
          "index": 0,
          "bitMask": "0b00000111"
        },
        "value": {
          "type": "level",
          "base": "0x00",
          "maximum": 8
        }
      },
      {
        "name": "modeOfElectronic",
        "descriptions": {
          "ja": "電気集塵方式：動作モード",
          "en": "Electronic dust collection:Mode"
        },
        "position": {
          "index": 0,
          "bitMask": "0b00001000"
        },
        "value": {
          "type": "state",
          "size": 0,
          "enum": [
            {
              "edt": "0x00",
              "name": "off",
              "descriptions": {
                "ja": "OFF",
                "en": "OFF"
              }
            },
            {
              "edt": "0x01",
              "name": "on",
              "descriptions": {
                "ja": "ON",
                "en": "ON"
              }
            }
          ]
        }
      },
      {
        "name": "autoOfElectronic",
        "descriptions": {
          "ja": "電気集塵方式：制御状態",
          "en": "Electronic dust collection:Auto function"
        },
        "position": {
          "index": 0,
          "bitMask": "0b00010000"
        },
        "value": {
          "type": "state",
          "size": 0,
          "enum": [
            {
              "edt": "0x00",
              "name": "false",
              "descriptions": {
                "ja": "非AUTO",
                "en": "Non-automatic"
              }
            },
            {
              "edt": "0x01",
              "name": "true",
              "descriptions": {
                "ja": "AUTO",
                "en": "Automatic"
              }
            }
          ]
        }
      },
      {
        "name": "levelOfClusterIon",
        "descriptions": {
          "ja": "クラスタイオン方式：制御レベル",
          "en": "Cluster ion:Level"
        },
        "position": {
          "index": 1,
          "bitMask": "0b00000111"
        },
        "value": {
          "type": "level",
          "base": "0x00",
          "maximum": 8
        }
      },
      {
        "name": "modeOfClusterIon",
        "descriptions": {
          "ja": "クラスタイオン方式：動作モード",
          "en": "Cluster ion:Mode"
        },
        "position": {
          "index": 1,
          "bitMask": "0b00001000"
        },
        "value": {
          "type": "state",
          "size": 0,
          "enum": [
            {
              "edt": "0x00",
              "name": "off",
              "descriptions": {
                "ja": "OFF",
                "en": "OFF"
              }
            },
            {
              "edt": "0x01",
              "name": "on",
              "descriptions": {
                "ja": "ON",
                "en": "ON"
              }
            }
          ]
        }
      },
      {
        "name": "autoOfClusterIon",
        "descriptions": {
          "ja": "クラスタイオン方式：制御状態",
          "en": "Cluster ion:Auto function"
        },
        "position": {
          "index": 1,
          "bitMask": "0b00010000"
        },
        "value": {
          "type": "state",
          "size": 0,
          "enum": [
            {
              "edt": "0x00",
              "name": "false",
              "descriptions": {
                "ja": "非AUTO",
                "en": "Non-automatic"
              }
            },
            {
              "edt": "0x01",
              "name": "true",
              "descriptions": {
                "ja": "AUTO",
                "en": "Automatic"
              }
            }
          ]
        }
      }
    ]
  };

  expect(converter.toObject(bitmapType, "0000000000000000")).toStrictEqual({
    levelOfElectronic: 1,
    modeOfElectronic: "off",
    autoOfElectronic: "false",
    levelOfClusterIon: 1,
    modeOfClusterIon: "off",
    autoOfClusterIon: "false"
  });
  expect(converter.toObject(bitmapType, "1f0e000000000000")).toStrictEqual({
    levelOfElectronic: 8,
    modeOfElectronic: "on",
    autoOfElectronic: "true",
    levelOfClusterIon: 7,
    modeOfClusterIon: "on",
    autoOfClusterIon: "false"
  });
  

  expect(converter.toEchoNetLiteData(bitmapType, {
    levelOfElectronic: 1,
    modeOfElectronic: "off",
    autoOfElectronic: "false",
    levelOfClusterIon: 1,
    modeOfClusterIon: "off",
    autoOfClusterIon: "false"
  })).toBe("0000000000000000");

  expect(converter.toEchoNetLiteData(bitmapType, {
    levelOfElectronic: 8,
    modeOfElectronic: "on",
    autoOfElectronic: "true",
    levelOfClusterIon: 7,
    modeOfClusterIon: "on",
    autoOfClusterIon: "false"
  })).toBe("1f0e000000000000");

})

test('convert data for ElArrayType', ()=>{
  const arrayType:ElArrayType = {
    "type": "array",
    "itemSize": 1,
    "minItems": 1,
    "maxItems": 253,
    "items": {
      "oneOf": [
        {
          "type": "number",
          "format": "uint8",
          "unit": "%",
          "minimum": 0,
          "maximum": 100
        },
        {
          "type": "state",
          "size": 1,
          "enum": [
            {
              "edt": "0xFF",
              "name": "unknown",
              "descriptions": {
                "ja": "不明",
                "en": "Unknown"
              },
              "readOnly": true
            }
          ]
        }
      ]
    }
  };

  expect(converter.toObject(arrayType, "000164ff")).toStrictEqual([0, 1, 100, "unknown"]);

  expect(converter.toEchoNetLiteData(arrayType, [0, 1, 100, "unknown"])).toBe("000164ff");

})
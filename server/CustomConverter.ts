import { DevicePropertySchema, MixedTypePropertySchema, ObjectPropertySchema } from "./AllDeviceDescriptions";
import { DefaultConverter, defaultParser, EchoNetParseData, StringConverter, UnknownConverter } from "./echoNetLiteParser";
import { commonConverterType, CustomAllConvertersType, DefaultConverters, electricWaterHeaterConverterType, homeAirConditionerConverterType, switchConverterType, Type_electricWaterHeater_electricEnergyConsumptionRate1, Type_electricWaterHeater_electricEnergyConsumptionRate2, Type_electricWaterHeater_estimatedElectricEnergyAtShiftTime1, Type_electricWaterHeater_estimatedElectricEnergyAtShiftTime2 } from "./interfaceType";
import { Property } from "./Property";
import EL from "echonet-lite";

const Manufacturers = {
  "000005":{ja:"シャープ株式会社", en:"Sharp Corporation"},
  "000006":{ja:"三菱電機株式会社", en:"Mitsubishi Electric Corporation"},
  "000008":{ja:"ダイキン工業株式会社", en:"Daikin Industries, Ltd."},
  "000009":{ja:"日本電気株式会社", en:"NEC Corporation"},
  "00000B":{ja:"パナソニック株式会社", en:"Panasonic Corporation"},
  "000016":{ja:"株式会社東芝", en:"Toshiba Corporation"},
  "00001B":{ja:"東芝ライテック株式会社", en:"Toshiba Lighting and Technology Corporation"},
  "000022":{ja:"日立アプライアンス株式会社", en:"Hitachi Appliances, Inc."},
  "00004E":{ja:"富士通株式会社", en:"Fujitsu Ltd."},
  "000053":{ja:"株式会社ユビキタス", en:"Ubiquitous Corporation"},
  "000059":{ja:"リンナイ株式会社", en:"Rinnai Corporation"},
  "00005E":{ja:"株式会社GWソーラー", en:"GM Solar Corporation"},
  "000060":{ja:"株式会社ソニーコンピュータサイエンス研究所", en:"Sony Computer Science Laboratories, Inc."},
  "000063":{ja:"河村電器産業株式会社", en:"Kawamura Electric, Inc."},
  "000064":{ja:"オムロン株式会社", en:"Omron Corporation, Inc."},
  "000069":{ja:"東芝ライフスタイル株式会社", en:"Toshiba Litestyle Products & Services Corporation"},
  "00006C":{ja:"ニチコン株式会社", en:"Nichikon Corporation"},
  "00006F":{ja:"株式会社バッファロー", en:"Buffalo Inc."},
  "000072":{ja:"株式会社エナリス", en:"ENERES Co., Ltd."},
  "000077":{ja:"神奈川工科大学", en:"Kanagawa Institute of Technology"},
  "000078":{ja:"日立マクセル株式会社", en:"Hitachi Maxell Ltd."},
  "00007D":{ja:"POWERTECH INDUSTRIAL", en:"POWERTECH INDUSTRIAL"},
  "000086":{ja:"西日本電信電話株式会社", en:"Nippon Telegraph and Telephone West Corporation"},
  "00008A":{ja:"株式会社富士通ゼネラル", en:"Fujitsu General Ltd."},
  "0000A3":{ja:"中部電力株式会社", en:"Chubu Electric Power Co., Ltd."},
  "0000AA":{ja:"株式会社テンフィートライト", en:"Ten Feet Wright, Inc."},
  "0000AE":{ja:"四国電力株式会社", en:"Shikoku Electric Power Co., Inc."},
  "0000B5":{ja:"中国電力株式会社", en:"Chugoku Electric Power Co., Inc."},
  "0000B6":{ja:"文化シヤッター株式会社", en:"Bunka Shutter Co., Ltd."},
  "0000B8":{ja:"北海道電力株式会社", en:"Hokkaido Electric Power Co., Inc."}, 
}

export const CommonConverter: Partial<commonConverterType> = {
  installationLocation:{
    toEchoNetLiteData : (schema:DevicePropertySchema, rootProperty:Property,data:string, currentData:string): string | undefined=>{
      if(data === "NotSet"){ return "00"; }
      if(data === "Indefinite"){ return "ff"; }
      
      {
        const matches = data.match(/Free_0x([0-9a-fA-F]+)/);
        if(matches!==null){
          return EL.bytesToString([parseInt(matches[1], 16)]);
        }
      }
      {
        const matches = data.match(/Living Room ([0-9])/);
        if(matches !== null){
          return EL.bytesToString([0x08 + Number(matches[1])]);
        }
      }
      {
        const matches = data.match(/Dining Room ([0-9])/)
        if(matches !== null){
          return EL.bytesToString([0x10 + Number(matches[1])]);
        }
      }
      {
        const matches = data.match(/Kitchen ([0-9])/)
        if(matches !== null){
          return EL.bytesToString([0x18 + Number(matches[1])]);
        }
      }
      {
        const matches = data.match(/Bathroom ([0-9])/)
        if(matches !== null){
          return EL.bytesToString([0x20 + Number(matches[1])]);
        }
      }
      {
        const matches = data.match(/Toilet ([0-9])/)
        if(matches !== null){
          return EL.bytesToString([0x28 + Number(matches[1])]);
        }
      }
      {
        const matches = data.match(/Dressing Room ([0-9])/)
        if(matches !== null){
          return EL.bytesToString([0x30 + Number(matches[1])]);
        }
      }
      {
        const matches = data.match(/Corridor ([0-9])/)
        if(matches !== null){
          return EL.bytesToString([0x38 + Number(matches[1])]);
        }
      }
      {
        const matches = data.match(/Room ([0-9])/)
        if(matches !== null){
          return EL.bytesToString([0x40 + Number(matches[1])]);
        }
      }
      {
        const matches = data.match(/Stairs ([0-9])/)
        if(matches !== null){
          return EL.bytesToString([0x48 + Number(matches[1])]);
        }
      }
      {
        const matches = data.match(/Hall ([0-9])/)
        if(matches !== null){
          return EL.bytesToString([0x50 + Number(matches[1])]);
        }
      }
      {
        const matches = data.match(/Storage ([0-9])/)
        if(matches !== null){
          return EL.bytesToString([0x58 + Number(matches[1])]);
        }
      }
      {
        const matches = data.match(/Garden ([0-9])/)
        if(matches !== null){
          return EL.bytesToString([0x60 + Number(matches[1])]);
        }
      }
      {
        const matches = data.match(/Garage ([0-9])/)
        if(matches !== null){
          return EL.bytesToString([0x68 + Number(matches[1])]);
        }
      }
      {
        const matches = data.match(/Balcony ([0-9])/)
        if(matches !== null){
          return EL.bytesToString([0x70 + Number(matches[1])]);
        }
      }
      {
        const matches = data.match(/Other ([0-9])/)
        if(matches !== null){
          return EL.bytesToString([0x78 + Number(matches[1])]);
        }
      }

      return "00";
    },
    toValue : (echoNetData:EchoNetParseData):string|undefined =>{
      const value = EL.toHexArray(echoNetData.data)[0];
      if(value === 0x00) {
        return "NotSet";
      }
      if(value === 0xff){
        return "Indefinite";
      }
      
      if((value & 0x80) !== 0){
        return "Free_0x" + value.toString(16);
      }
      const lowNo = value & 0x07;
      switch((value & 0x78)){
        case 0x08: return "Living Room " + lowNo;
        case 0x10: return "Dining Room " + lowNo;
        case 0x18: return "Kitchen " + lowNo;
        case 0x20: return "Bathroom " + lowNo;
        case 0x28: return "Toilet " + lowNo;
        case 0x30: return "Dressing Room " + lowNo;
        case 0x38: return "Corridor " + lowNo;
        case 0x40: return "Room " + lowNo;
        case 0x48: return "Stairs " + lowNo;
        case 0x50: return "Hall " + lowNo;
        case 0x58: return "Storage " + lowNo;
        case 0x60: return "Garden " + lowNo;
        case 0x68: return "Garage " + lowNo;
        case 0x70: return "Balcony " + lowNo;
        case 0x78: return "Other " + lowNo;
        default:
          break;
      }
      return "Undefined 0x" + value.toString(16);
    }
  },
  protocol: {
    toEchoNetLiteData : (schema:DevicePropertySchema, rootProperty:Property,data:{type:string,version:string}, currentData:string): string | undefined=>{
      return undefined;
    },
    toValue : (echoNetData:EchoNetParseData):{type:string,version:string}|undefined =>{
      return {
        type:"ECHONET_Lite v1.13",
        version:"Rel." + String.fromCharCode(parseInt(echoNetData.data.substr(4, 2), 16))
      };
    }
  },
  id:new StringConverter(),
  manufacturerFaultCode: new StringConverter(),
  faultDescription: new StringConverter(),
  manufacturer: {
    toEchoNetLiteData : (schema:DevicePropertySchema, rootProperty:Property,data:{code:string,descriptions:{ja:string,en:string}}, currentData:string): string | undefined=>{
      return undefined;
    },
    toValue : (echoNetData:EchoNetParseData):{code:string,descriptions:{ja:string,en:string}}|undefined =>{
      
      let description = {ja:"不明", en:"unknown"};
      const code = echoNetData.data.toUpperCase();
      if(code in Manufacturers){
        description = (Manufacturers as any)[code];
      }

      return {
        code: echoNetData.data,
        descriptions:description
      };
    }
  },
  businessFacilityCode:new StringConverter(),
  productCode:new StringConverter(),
  serialNumber:new StringConverter(),
  hourMeter: {
    toEchoNetLiteData : (schema:DevicePropertySchema, rootProperty:Property,data:number, currentData:string): string | undefined=>{
      return undefined;
    },
    toValue : (echoNetData:EchoNetParseData):number|undefined =>{
      const values = EL.toHexArray(echoNetData.data);
      
      let result = 0;
      for(let i = 1; i < values.length; i++)
      {
        result *= 256;
        result += values[i];
      }
      if(values[0] === 0x41){
        result /= 60 * 60;
      }
      if(values[0] === 0x42)
      {
        result /= 60;
      }
      if(values[0] === 0x44)
      {
        result *= 24;
      }
      return result;
    }
  }
};

export const homeAirConditionerConverter : Partial<homeAirConditionerConverterType> = {

  airFlowLevel: {
    toEchoNetLiteData : (schema:DevicePropertySchema, rootProperty:Property,data:number|"auto", currentData:string): string | undefined=>{
      return EL.bytesToString([data === 'auto' ? 0x41 : 0x30 + data]);
    },
    toValue : (echoNetData:EchoNetParseData):number|"auto"|undefined =>{
      const value = EL.toHexArray(echoNetData.data)[0];
      if (value === 0x41) {
        return 'auto';
      } else if (0x31 <= value && value <= 0x38) {
        return value - 0x30;
      } else {
        return undefined;
      }
    }
  },

  ratedPowerConsumption: {
    toEchoNetLiteData : (schema:DevicePropertySchema, rootProperty:Property,data:{cooling:Number|"unsupported",heating:Number|"unsupported",dehumidifying:Number|"unsupported",circulation:Number|"unsupported"}, currentData:string): string | undefined=>{
      return undefined;
    },
    toValue : (echoNetData:EchoNetParseData):{cooling:Number|"unsupported",heating:Number|"unsupported",dehumidifying:Number|"unsupported",circulation:Number|"unsupported"}|undefined =>{
      const schema = echoNetData.schema as ObjectPropertySchema;
      
      return {
        cooling:defaultParser({
          rootProperty: echoNetData.rootProperty,
          schema: schema.properties["cooling"],
          data:echoNetData.data.substr(0, 2)
        }),
        heating:defaultParser({
          rootProperty: echoNetData.rootProperty,
          schema: schema.properties["heating"],
          data:echoNetData.data.substr(2, 2)
        }),
        dehumidifying:defaultParser({
          rootProperty: echoNetData.rootProperty,
          schema: schema.properties["dehumidifying"],
          data:echoNetData.data.substr(4, 2)
        }),
        circulation:defaultParser({
          rootProperty: echoNetData.rootProperty,
          schema: schema.properties["circulation"],
          data:echoNetData.data.substr(6, 2)
        })
      };
    }
  },
  airCleaningMethod:  {
    toEchoNetLiteData : (schema:DevicePropertySchema, rootProperty:Property,data:{electronic:"no"|"yes",clusterIon:"no"|"yes"}, currentData:string): string | undefined=>{
      return undefined;
    },
    toValue : (echoNetData:EchoNetParseData):{electronic:"no"|"yes",clusterIon:"no"|"yes"}|undefined =>{
      const value = EL.toHexArray(echoNetData.data)[0];
      return {
        electronic: (value & 0x01) !== 0 ? "yes" : "no",
        clusterIon: (value & 0x02) !== 0 ? "yes" : "no",
      }
    }
  },
  airPurifierFunction:  {
    toEchoNetLiteData : (schema:DevicePropertySchema, rootProperty:Property,data:{electronicLevel:number,electronicMode:"off"|"on",electronicAuto:"nonAuto"|"auto",clusterIonLevel:number,clusterIonMode:"off"|"on",clusterIonAuto:"nonAuto"|"auto"}, currentData:string): string | undefined=>{
      const array = [0,0,0,0,0,0,0,0];
      array[0] += data.electronicLevel & 0x07
      array[0] += data.electronicMode === "on" ? 0x08 : 0x00
      array[0] += data.electronicAuto === "auto" ? 0x10 : 0x00
      array[1] += data.clusterIonLevel & 0x07
      array[1] += data.clusterIonMode === "on" ? 0x08 : 0x00
      array[1] += data.clusterIonAuto === "auto" ? 0x10 : 0x00
      return EL.bytesToString(array);
    },
    toValue : (echoNetData:EchoNetParseData):{electronicLevel:Number,electronicMode:"off"|"on",electronicAuto:"nonAuto"|"auto",clusterIonLevel:Number,clusterIonMode:"off"|"on",clusterIonAuto:"nonAuto"|"auto"}|undefined =>{
      const electronicValue = EL.toHexArray(echoNetData.data)[0];
      const clusterIonValue = EL.toHexArray(echoNetData.data)[1];
      return {
        electronicLevel: electronicValue & 0x07,
        electronicMode: (electronicValue & 0x08) !== 0 ? "on" : "off",
        electronicAuto: (electronicValue & 0x10) !== 0 ? "auto" : "nonAuto",
        clusterIonLevel: clusterIonValue & 0x07,
        clusterIonMode: (clusterIonValue & 0x08) !== 0 ? "on" : "off",
        clusterIonAuto: (clusterIonValue & 0x10) !== 0 ? "auto" : "nonAuto",
      }
    }
  },

  airRefreshMethod:  {
    toEchoNetLiteData : (schema:DevicePropertySchema, rootProperty:Property,data:{minusIon:"no"|"yes",clusterIon:"no"|"yes"}, currentData:string): string | undefined=>{
      return undefined;
    },
    toValue : (echoNetData:EchoNetParseData):{minusIon:"no"|"yes",clusterIon:"no"|"yes"}|undefined =>{
      const value = EL.toHexArray(echoNetData.data)[0];
      return {
        minusIon: (value & 0x01) !== 0 ? "yes" : "no",
        clusterIon: (value & 0x02) !== 0 ? "yes" : "no",
      }
    }
  },

  airRefresherFunction:   {
    toEchoNetLiteData : (schema:DevicePropertySchema, rootProperty:Property,data:{minusIonLevel:number,minusIonMode:"off"|"on",minusIonAuto:"nonAuto"|"auto",clusterIonLevel:number,clusterIonMode:"off"|"on",clusterIonAuto:"nonAuto"|"auto"}, currentData:string): string | undefined=>{
      const array = [0,0,0,0,0,0,0,0];
      array[0] += data.minusIonLevel & 0x07
      array[0] += data.minusIonMode === "on" ? 0x08 : 0x00
      array[0] += data.minusIonAuto === "auto" ? 0x10 : 0x00
      array[1] += data.clusterIonLevel & 0x07
      array[1] += data.clusterIonMode === "on" ? 0x08 : 0x00
      array[1] += data.clusterIonAuto === "auto" ? 0x10 : 0x00
      return EL.bytesToString(array);
    },
    toValue : (echoNetData:EchoNetParseData):{minusIonLevel:Number,minusIonMode:"off"|"on",minusIonAuto:"nonAuto"|"auto",clusterIonLevel:Number,clusterIonMode:"off"|"on",clusterIonAuto:"nonAuto"|"auto"}|undefined =>{
      const minusIonValue = EL.toHexArray(echoNetData.data)[0];
      const clusterIonValue = EL.toHexArray(echoNetData.data)[1];
      return {
        minusIonLevel: minusIonValue & 0x07,
        minusIonMode: (minusIonValue & 0x08) !== 0 ? "on" : "off",
        minusIonAuto: (minusIonValue & 0x10) !== 0 ? "auto" : "nonAuto",
        clusterIonLevel: clusterIonValue & 0x07,
        clusterIonMode: (clusterIonValue & 0x08) !== 0 ? "on" : "off",
        clusterIonAuto: (clusterIonValue & 0x10) !== 0 ? "auto" : "nonAuto",
      }
    }
  },
  selfCleaningMethod: {
    toEchoNetLiteData : (schema:DevicePropertySchema, rootProperty:Property,data:{ozone:"no"|"yes",drying:"no"|"yes"}, currentData:string): string | undefined=>{
      return undefined;
    },
    toValue : (echoNetData:EchoNetParseData):{ozone:"no"|"yes",drying:"no"|"yes"}|undefined =>{
      const value = EL.toHexArray(echoNetData.data)[0];
      return {
        ozone: (value & 0x01) !== 0 ? "yes" : "no",
        drying: (value & 0x02) !== 0 ? "yes" : "no",
      }
    }
  },

  selfCleaningFunction: {
    toEchoNetLiteData : (schema:DevicePropertySchema, rootProperty:Property,data:{ozoneLevel:number,ozoneMode:"off"|"on",ozoneAuto:"nonAuto"|"auto",dryingLevel:number,dryingMode:"off"|"on",dryingAuto:"nonAuto"|"auto"}, currentData:string): string | undefined=>{
      const array = [0,0,0,0,0,0,0,0];
      array[0] += data.ozoneLevel & 0x07
      array[0] += data.ozoneMode === "on" ? 0x08 : 0x00
      array[0] += data.ozoneAuto === "auto" ? 0x10 : 0x00
      array[1] += data.dryingLevel & 0x07
      array[1] += data.dryingMode === "on" ? 0x08 : 0x00
      array[1] += data.dryingAuto === "auto" ? 0x10 : 0x00
      return EL.bytesToString(array);
    },
    toValue : (echoNetData:EchoNetParseData):{ozoneLevel:Number,ozoneMode:"off"|"on",ozoneAuto:"nonAuto"|"auto",dryingLevel:Number,dryingMode:"off"|"on",dryingAuto:"nonAuto"|"auto"}|undefined =>{
      const minusIonValue = EL.toHexArray(echoNetData.data)[0];
      const clusterIonValue = EL.toHexArray(echoNetData.data)[1];
      return {
        ozoneLevel: minusIonValue & 0x07,
        ozoneMode: (minusIonValue & 0x08) !== 0 ? "on" : "off",
        ozoneAuto: (minusIonValue & 0x10) !== 0 ? "auto" : "nonAuto",
        dryingLevel: clusterIonValue & 0x07,
        dryingMode: (clusterIonValue & 0x08) !== 0 ? "on" : "off",
        dryingAuto: (clusterIonValue & 0x10) !== 0 ? "auto" : "nonAuto",
      }
    }
  },
  componentsOperationStatus: {
    toEchoNetLiteData : (schema:DevicePropertySchema, rootProperty:Property,data:{compressor:"off"|"on",thermostat:"off"|"on"}, currentData:string): string | undefined=>{
      return undefined;
    },
    toValue : (echoNetData:EchoNetParseData):{compressor:"off"|"on",thermostat:"off"|"on"}|undefined =>{
      const value = EL.toHexArray(echoNetData.data)[0];
      return {
        compressor: (value & 0x01) !== 0 ? "on" : "off",
        thermostat: (value & 0x02) !== 0 ? "on" : "off",
      }
    }
  }
};
export const electricWaterHeaterConverter : Partial<electricWaterHeaterConverterType> = {
  estimatedElectricEnergyAtShiftTime1: {
    toEchoNetLiteData : (schema:DevicePropertySchema, rootProperty:Property,data:Type_electricWaterHeater_estimatedElectricEnergyAtShiftTime1, currentData:string): string | undefined=>{
      return undefined;
    },
    toValue : (echoNetData:EchoNetParseData):Type_electricWaterHeater_estimatedElectricEnergyAtShiftTime1|undefined =>{
      const objectPropertySchema = echoNetData.schema as ObjectPropertySchema;
      
      return {
        at1000: defaultParser({
          rootProperty: echoNetData.rootProperty,
          data: echoNetData.data.substr(0, 8),
          schema: objectPropertySchema.properties["at1000"]
        }),
        at1300: defaultParser({
          rootProperty: echoNetData.rootProperty,
          data: echoNetData.data.substr(8, 8),
          schema: objectPropertySchema.properties["at1300"]
        }),
        at1500: defaultParser({
          rootProperty: echoNetData.rootProperty,
          data: echoNetData.data.substr(16, 8),
          schema: objectPropertySchema.properties["at1500"]
        }),
        at1700: defaultParser({
          rootProperty: echoNetData.rootProperty,
          data: echoNetData.data.substr(24, 8),
          schema: objectPropertySchema.properties["at1700"]
        })
      };
    }
  },
  electricEnergyConsumptionRate1: {
    toEchoNetLiteData : (schema:DevicePropertySchema, rootProperty:Property,data:Type_electricWaterHeater_electricEnergyConsumptionRate1, currentData:string): string | undefined=>{
      return undefined;
    },
    toValue : (echoNetData:EchoNetParseData):Type_electricWaterHeater_electricEnergyConsumptionRate1|undefined =>{
      const objectPropertySchema = echoNetData.schema as ObjectPropertySchema;
      return {
        at1000: defaultParser({
          rootProperty: echoNetData.rootProperty,
          data: echoNetData.data.substr(0, 4),
          schema: objectPropertySchema.properties["at1000"]
        }),
        at1300: defaultParser({
          rootProperty: echoNetData.rootProperty,
          data: echoNetData.data.substr(4, 4),
          schema: objectPropertySchema.properties["at1300"]
        }),
        at1500: defaultParser({
          rootProperty: echoNetData.rootProperty,
          data: echoNetData.data.substr(8, 4),
          schema: objectPropertySchema.properties["at1500"]
        }),
        at1700: defaultParser({
          rootProperty: echoNetData.rootProperty,
          data: echoNetData.data.substr(12, 4),
          schema: objectPropertySchema.properties["at1700"]
        })
      };
    }
  },
  estimatedElectricEnergyAtShiftTime2: {
    toEchoNetLiteData : (schema:DevicePropertySchema, rootProperty:Property,data:Type_electricWaterHeater_estimatedElectricEnergyAtShiftTime2, currentData:string): string | undefined=>{
      return undefined;
    },
    toValue : (echoNetData:EchoNetParseData):Type_electricWaterHeater_estimatedElectricEnergyAtShiftTime2|undefined =>{
      const objectPropertySchema = echoNetData.schema as ObjectPropertySchema;
      
      return {
        at1300: defaultParser({
          rootProperty: echoNetData.rootProperty,
          data: echoNetData.data.substr(0, 8),
          schema: objectPropertySchema.properties["at1300"]
        }),
        at1500: defaultParser({
          rootProperty: echoNetData.rootProperty,
          data: echoNetData.data.substr(8, 8),
          schema: objectPropertySchema.properties["at1500"]
        }),
        at1700: defaultParser({
          rootProperty: echoNetData.rootProperty,
          data: echoNetData.data.substr(16, 8),
          schema: objectPropertySchema.properties["at1700"]
        })
      };
    }
  },
  electricEnergyConsumptionRate2: {
    toEchoNetLiteData : (schema:DevicePropertySchema, rootProperty:Property,data:Type_electricWaterHeater_electricEnergyConsumptionRate2, currentData:string): string | undefined=>{
      return undefined;
    },
    toValue : (echoNetData:EchoNetParseData):Type_electricWaterHeater_electricEnergyConsumptionRate2|undefined =>{
      const objectPropertySchema = echoNetData.schema as ObjectPropertySchema;
      return {
        at1300: defaultParser({
          rootProperty: echoNetData.rootProperty,
          data: echoNetData.data.substr(0, 4),
          schema: objectPropertySchema.properties["at1300"]
        }),
        at1500: defaultParser({
          rootProperty: echoNetData.rootProperty,
          data: echoNetData.data.substr(4, 4),
          schema: objectPropertySchema.properties["at1500"]
        }),
        at1700: defaultParser({
          rootProperty: echoNetData.rootProperty,
          data: echoNetData.data.substr(8, 4),
          schema: objectPropertySchema.properties["at1700"]
        })
      };
    }
  },
}

// スイッチ (JEMA/HA端子対応) eoj:0x05FD
export const switchConverter:Partial<switchConverterType> = {
  connectedDevice:{
    toEchoNetLiteData : (schema:DevicePropertySchema, rootProperty:Property,data:string, currentData:string): string | undefined=>{
      return data;
    },
    toValue : (echoNetData:EchoNetParseData): string | undefined =>{
      return echoNetData.data;
    }
  }
};

export const CustomAllConverters : Partial<CustomAllConvertersType> = {
  common: CommonConverter,
  homeAirConditioner: homeAirConditionerConverter,
  electricWaterHeater: electricWaterHeaterConverter,
  switch: switchConverter
};

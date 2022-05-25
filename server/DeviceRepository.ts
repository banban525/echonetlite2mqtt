import EL, { eldata,facilitiesType,rinfo } from "echonet-lite";
import all from "../device_descriptions_v1.3.0/all_device_descriptions_v1.3.0.json"
import { DeviceProperty, DevicePropertySchema, DeviceType, MixedTypePropertySchema } from "./AllDeviceDescriptions";
import { Device, DeviceId, Manufacturer, Property, PropertyValue } from "./Property";
import { Converter } from "./echoNetLiteParser";
import { EchoNetConverter } from "./EchoNetConverter";
import dayjs from 'dayjs';

export default class DeviceRepository{
  //private deviceList: device[] = [];

  public getDeviceIdList =  (echonetLiteFacilities:facilitiesType): DeviceId[] =>{
    const result:DeviceId[] = [];
    for(const ip in echonetLiteFacilities)
    {
      for(const eoj in echonetLiteFacilities[ip]){
  
        // if(this.deviceList.filter(_=>_.ip === ip && _.eoj === eoj).length !== 0)
        // {
        //   continue;
        // }
  
        if(("9f" in echonetLiteFacilities[ip][eoj]) === false || 
          ("9e" in echonetLiteFacilities[ip][eoj]) === false || 
          ("9d" in echonetLiteFacilities[ip][eoj]) === false ||
          ("8a" in echonetLiteFacilities[ip][eoj]) ===false)
        {
          continue;
        }
        const getPropertyNoList = this.convertGetPropertyNoList(ip, eoj, echonetLiteFacilities);
        if(getPropertyNoList === undefined)
        {
          continue;
        }
        const notGetPropertyCount = getPropertyNoList.filter(_=>(_ in echonetLiteFacilities[ip][eoj])===false).length
        if(notGetPropertyCount !== 0)
        {
          continue;
        }
  
        let id = this.getDeviceId(ip, eoj, echonetLiteFacilities);
        if(id === "")
        {
          continue;
        }

        result.push({
          id,
          ip,
          eoj
        });
      }
    }
    return result;
  }

  public createDevice = (deviceId:DeviceId, echonetLiteFacilities:facilitiesType):Device|undefined => {

    const getPropertyNoList = this.convertGetPropertyNoList(deviceId.ip, deviceId.eoj, echonetLiteFacilities);
    if(getPropertyNoList === undefined)
    {
      return undefined;
    }
    let id = this.getDeviceId(deviceId.ip, deviceId.eoj, echonetLiteFacilities);
    if(id === "")
    {
      return undefined;
    }
    const manufacturer = this.getManufacturer(deviceId.ip, deviceId.eoj, echonetLiteFacilities);
    if(manufacturer === undefined)
    {
      return undefined;
    }
    const setPropertyNoList:string[] = [];
    const setPropertyListText = echonetLiteFacilities[deviceId.ip][deviceId.eoj]["9e"];
    for(let i = 2; i < setPropertyListText.length; i+=2)
    {
      setPropertyNoList.push(setPropertyListText.substr(i, 2));
    }

    const notifyPropertyNoList:string[] = [];
    const notifyPropertyListText = echonetLiteFacilities[deviceId.ip][deviceId.eoj]["9d"];
    for(let i = 2; i < notifyPropertyListText.length; i+=2)
    {
      notifyPropertyNoList.push(notifyPropertyListText.substr(i, 2));
    }

    const newDevice = this.createDevice2(
      id, 
      deviceId.ip, 
      deviceId.eoj, 
      getPropertyNoList, 
      setPropertyNoList, 
      notifyPropertyNoList, 
      echonetLiteFacilities[deviceId.ip][deviceId.eoj],
      manufacturer);
    //this.deviceList.push(newDevice);


    //console.log(`${newDevice.id} ${newDevice.deviceType}(${newDevice.descriptions.ja}, ip:${deviceId.ip}, eoj:${deviceId.eoj})`);
    return newDevice;
  }

  // public createDeviceList = (echonetLiteFacilities:facilitiesType):void =>
  // {
  //   for(const ip in echonetLiteFacilities)
  //   {
  //     for(const eoj in echonetLiteFacilities[ip]){
  
  //       if(this.deviceList.filter(_=>_.ip === ip && _.eoj === eoj).length !== 0)
  //       {
  //         continue;
  //       }
  
  //       if(("9f" in echonetLiteFacilities[ip][eoj]) === false || 
  //         ("9e" in echonetLiteFacilities[ip][eoj]) === false || 
  //         ("9d" in echonetLiteFacilities[ip][eoj]) === false ||
  //         ("8a" in echonetLiteFacilities[ip][eoj]) ===false)
  //       {
  //         continue;
  //       }
  
  //       const getPropertyNoList = this.convertGetPropertyNoList(ip, eoj, echonetLiteFacilities);
  //       if(getPropertyNoList === undefined)
  //       {
  //         continue;
  //       }
  //       let id = this.getDeviceId(ip, eoj, echonetLiteFacilities);
  //       if(id === "")
  //       {
  //         continue;
  //       }
  //       const manufacturer = this.getManufacturer(ip, eoj, echonetLiteFacilities);
  //       if(manufacturer === undefined)
  //       {
  //         continue;
  //       }
  //       const setPropertyNoList:string[] = [];
  //       const setPropertyListText = echonetLiteFacilities[ip][eoj]["9e"];
  //       for(let i = 2; i < setPropertyListText.length; i+=2)
  //       {
  //         setPropertyNoList.push(setPropertyListText.substr(i, 2));
  //       }
  
  //       const notifyPropertyNoList:string[] = [];
  //       const notifyPropertyListText = echonetLiteFacilities[ip][eoj]["9d"];
  //       for(let i = 2; i < notifyPropertyListText.length; i+=2)
  //       {
  //         notifyPropertyNoList.push(notifyPropertyListText.substr(i, 2));
  //       }
  
  //       const newDevice = this.createDevice(id, ip, eoj, getPropertyNoList, setPropertyNoList, notifyPropertyNoList, manufacturer);
  //       this.deviceList.push(newDevice);
  
  
  //       console.log(`${newDevice.id} ${newDevice.deviceType}(${newDevice.descriptions.ja}, ip:${ip}, eoj:${eoj})`);
  
  
  //       for(const prop of newDevice.properties){
  //         console.log(`  ${prop.name}(${prop.descriptions.ja}) r${prop.writable?"w": ""}${prop.observable?"n": ""}`);
  
  //         // publishDevices(deviceList);
  //         // publishDevice(newDevice);
  //         // publishProperty(prop);
    
  
  //       }
  //     }
  //   }
  // }

  private createDevice2 = (
      id:string, 
      ip:string, 
      eoj:string, 
      getPropertyNoList:string[], 
      setPropertyNoList:string[], 
      notifyPropertyNoList:string[],
      echoNetRawData: {[key:string]:string},
      manufacturer:Manufacturer):Device =>
  {
    const eojClass = "0x" + eoj.substring(0, 4).toUpperCase();
    const matchedDeviceTypes = all.devices.filter(_=>_.eoj === eojClass);
    if(matchedDeviceTypes.length === 0)
    {
      return {
        id,
        ip,
        eoj,
        properties:[],
        deviceType:"unknown",
        descriptions: {
          ja:"不明",
          en:"unknown"
        },
        protocol:{
          type:"ECHONET_Lite v1.13",
          version: "Rel.P"
        },
        manufacturer,
        propertiesValue:{}
      };
    }
    const deviceType = matchedDeviceTypes[0];
  
    const properties:Property[] = [];
    for(const propertyNo of getPropertyNoList)
    {
      if(propertyNo === "9d" || propertyNo === "9e" || propertyNo === "9f"){
        continue;
      }
      const epc = "0x" + propertyNo.toUpperCase();
  
      const matchedCommonProperties = Object.keys(all.common.properties)
        .map((propertyName:string):Property => ({
          name:propertyName,
          ...all.common.properties[propertyName]
        }))
        .filter((property:DeviceProperty):boolean=>property.epc === epc)
      if(matchedCommonProperties.length !== 0)
      {
        properties.push(matchedCommonProperties[0]);
        continue;
      }
      
      const matchedDeviceProperties = Object.keys(deviceType.properties)
        .map((propertyName:string):Property=>({
          name:propertyName,
          ...deviceType.properties[propertyName]
        }))
        .filter((property:DeviceProperty):boolean=>property.epc === epc)
  
      if(matchedDeviceProperties.length !== 0)
      {
        properties.push(matchedDeviceProperties[0]);
        continue;
      }
      console.log(`ERROR: unknown property. propertyNo === ${propertyNo} in eoj:${eoj}`);
    }
  
    for(const propertyNo of setPropertyNoList)
    {
      if(propertyNo === "9d" || propertyNo === "9e" || propertyNo === "9f"){
        continue;
      }
      const epc = "0x" + propertyNo.toUpperCase();
      const matchedProperties = properties.filter((_):boolean=>_.epc === epc);
      if(matchedProperties.length !== 0)
      {
        matchedProperties[0].writable = true;
        continue;
      }
      console.log(`ERROR: unknown property. propertyNo === ${propertyNo} in eoj:${eoj}`);
    }
  
    for(const propertyNo of notifyPropertyNoList)
    {
      if(propertyNo === "9d" || propertyNo === "9e" || propertyNo === "9f"){
        continue;
      }
      const epc = "0x" + propertyNo.toUpperCase();
      const matchedProperties = properties.filter((_):boolean=>_.epc === epc);
      if(matchedProperties.length !== 0)
      {
        matchedProperties[0].observable = true;
        continue;
      }
      console.log(`ERROR: unknown property. propertyNo === ${propertyNo} in eoj:${eoj}`);
    }

    const propertiesValue:{[key:string]:PropertyValue} = {};
    for(const property of properties){
      const value = this.getPropertyValue({id,ip,eoj}, property);
      propertiesValue[property.name] = {
        name: property.name,
        deviceProperty: property,
        value: value,
        updated: dayjs(Date()).format("YYYY-MM-DD HH:mm:ss")
      };
    }
  
    return {
      id,
      ip,
      eoj,
      deviceType: deviceType.deviceType,
      descriptions: deviceType.descriptions,
      properties,
      protocol:{
        type:"ECHONET_Lite v1.13",
        version: "Rel.P"
      },
      manufacturer,
      propertiesValue
    }
  }
    
  private getManufacturer = (ip:string, eoj:string, facilities:facilitiesType):Manufacturer|undefined => {
    const manufacturerCode = facilities[ip][eoj]["8a"];
    if(manufacturerCode===undefined)
    {
      return undefined;
    }
    return {
      code:manufacturerCode,
      descriptions:{
        en:"",
        ja:""
      }
    }
  }
    
    
  private convertGetPropertyNoList = (ip:string, eoj:string, facilities:facilitiesType): string[]|undefined => {
  
    const getPropertyListText = facilities[ip][eoj]["9f"];
    if(getPropertyListText===undefined)
    {
      return undefined;
    }
  
    const getPropertyNoList:string[] = [];
    for(let i = 2; i < getPropertyListText.length; i+=2)
    {
      getPropertyNoList.push(getPropertyListText.substr(i, 2));
    }
    return getPropertyNoList;
  }

  private getDeviceId = (ip:string, eoj:string, facilities:facilitiesType):string => {
    let id = "";
  
    const getPropertyNoList = this.convertGetPropertyNoList(ip, eoj, facilities);
    if(getPropertyNoList === undefined)
    {
      return "";
    }
  
    // 識別番号を持つ場合は、それをIdにする。
    if(getPropertyNoList.find((_):boolean=>_ === "83") !== undefined){
      if("83" in facilities[ip][eoj] === false)
      {
        // 識別番号が未取得なら、取得されるまで待つ
        console.log(`id is not get in ${ip} ${eoj}`);
        return "";
      }
      id = facilities[ip][eoj]["83"];
    }
    // 識別番号が無い機器の場合は、ノードの識別番号+eojにする
    if(id === "")
    {
      const nodeProfile = facilities[ip]["0ef001"];
      if(nodeProfile===undefined)
      {
        // ノードが未取得なら、取得されるまで待つ
        console.log(`node is not found in ${ip} ${eoj}`);
        return "";
      }
      const nodeGetProperty = nodeProfile["9f"];
      if(nodeGetProperty === undefined)
      {
        // ノードのプロパティリストが未取得なら、取得されるまで待つ
        console.log(`node property list are not get in ${ip} ${eoj}`);
        return "";
      }
      
      let nodeHasId = false;
      for(let i = 2; i < nodeGetProperty.length; i+=2)
      {
        if(nodeGetProperty.substr(i, 2) === "83")
        {
          nodeHasId = true;
        }
      }
      if(nodeHasId)
      {
        const nodeId = facilities[ip]["0ef001"]["83"];
        if(nodeId === undefined)
        {
          // ノードのIDが未取得なら取得されるまで待つ
          console.log(`node id is not get in ${ip} ${eoj}`);
          return "";
        }
        id = nodeId + "_" + eoj;
      }
    }
    if(id === "")
    {
        //ノードの識別番号が無い場合は、IP+eojにする
        id = ip + "_" + eoj;
    }
  
    return id;
  }

  public getPropertyWithEpc = (deviceId: DeviceId, epc:string): Property|undefined =>{
    if((deviceId.ip in EL.facilities) === false){
      return undefined;
    }
    if((deviceId.eoj in EL.facilities[deviceId.ip]) === false)
    {
      return undefined;
    }

    // コンバート可能なデバイスかチェック
    const deviceClass = "0x"+deviceId.eoj.substr(0, 4).toUpperCase();
    const foundDevice = all.devices.find(_=>_.eoj === deviceClass);
    if(foundDevice === undefined){
      return undefined;
    }
    
    let propertyName = Object.keys(foundDevice.properties).find(_=>foundDevice.properties[_].epc === "0x" + epc.toUpperCase());
    if(propertyName === undefined)
    {
      propertyName = Object.keys(all.common.properties).find(_=>all.common.properties[_].epc === "0x" + epc.toUpperCase());
    }
    if(propertyName===undefined)
    {
      return undefined;
    }
    return this.getProperty(deviceId, propertyName);
  }

  public getProperty = (deviceId: DeviceId, propertyName:string): Property|undefined =>{
    if((deviceId.ip in EL.facilities) === false){
      return undefined;
    }
    if((deviceId.eoj in EL.facilities[deviceId.ip]) === false)
    {
      return undefined;
    }

    // コンバート可能なデバイスかチェック
    const deviceClass = "0x"+deviceId.eoj.substr(0, 4).toUpperCase();
    const foundDevice = all.devices.find(_=>_.eoj === deviceClass);
    if(foundDevice === undefined){
      return undefined;
    }
    
    let deviceTypeName:string|undefined;
    let deviceProperty:DeviceProperty | undefined;
    // コンバート可能なプロパティかチェック
    if(propertyName in foundDevice.properties)
    {
      deviceProperty=foundDevice.properties[propertyName];
      deviceTypeName = foundDevice.deviceType;
    }
    else
    {
      if(propertyName in all.common.properties)
      {
        deviceProperty=all.common.properties[propertyName];
        deviceTypeName = all.common.deviceType;
      }
      else
      {
        deviceProperty=undefined;
        deviceTypeName=undefined;
      }
    }
    if(deviceProperty === undefined || deviceTypeName === undefined)
    {
      return undefined;
    }
    return {
      ...deviceProperty,
      name:propertyName
    };
  }

  public propertyToEchoNetData = (deviceId:DeviceId, propertyName:string, value:any):string|undefined => {
    if((deviceId.ip in EL.facilities) === false){
      console.log(`propertyToEchoNetData (deviceId.ip in EL.facilities) === false`)
      return undefined;
    }
    if((deviceId.eoj in EL.facilities[deviceId.ip]) === false)
    {
      console.log(`propertyToEchoNetData (deviceId.eoj in EL.facilities[deviceId.ip]) === false`)
      return undefined;
    }

    // コンバート可能なデバイスかチェック
    const deviceClass = "0x"+deviceId.eoj.substr(0, 4).toUpperCase();
    const foundDevice = all.devices.find(_=>_.eoj === deviceClass);
    if(foundDevice === undefined){
      console.log(`propertyToEchoNetData foundDevice === undefined`)
      return undefined;
    }
    
    let deviceTypeName:string|undefined;
    let deviceProperty:DeviceProperty | undefined;
    // コンバート可能なプロパティかチェック
    if(propertyName in foundDevice.properties)
    {
      deviceProperty=foundDevice.properties[propertyName];
      deviceTypeName = foundDevice.deviceType;
    }
    else
    {
      if(propertyName in all.common.properties)
      {
        deviceProperty=all.common.properties[propertyName];
        deviceTypeName = all.common.deviceType;
      }
      else
      {
        deviceProperty=undefined;
        deviceTypeName=undefined;
      }
    }
    if(deviceProperty === undefined || deviceTypeName === undefined)
    {
      console.log(`propertyToEchoNetData deviceProperty === undefined || deviceTypeName === undefined`)
      return undefined;
    }
    const epc = deviceProperty.epc.toLowerCase().replace(/^0x/gi, "");
    if((epc in EL.facilities[deviceId.ip][deviceId.eoj])===false)
    {
      console.log(`propertyToEchoNetData (epc in EL.facilities[deviceId.ip][deviceId.eoj])===false  epc=${epc}`);
      return undefined;
    }
    const currentValue = EL.facilities[deviceId.ip][deviceId.eoj][epc];

    if((deviceTypeName in EchoNetConverter)===false)
    {
      console.log(`propertyToEchoNetData (deviceTypeName in EchoNetConverter)===false`)
      return undefined;
    }
    const deviceConverter = (EchoNetConverter as any)[deviceTypeName] as any;
    if((propertyName in deviceConverter)===false)
    {
      console.log(`propertyToEchoNetData (propertyName in deviceConverter)===false`)
      return undefined;
    }
    const propertyConverter = deviceConverter[propertyName] as Converter<any>;
    EL.facilities
    const echoNetData = propertyConverter.toEchoNetLiteData(deviceProperty.schema,{
      ...deviceProperty,
      name:propertyName
    } , value, currentValue);
    
    if(echoNetData===undefined){
      console.log(`propertyToEchoNetData echoNetData===undefined`)
      return undefined;
    }

    return echoNetData;
  }

  public getPropertyValue = (deviceId:DeviceId, property:Property): unknown|undefined=>{

    const echoNetRawData = EL.facilities[deviceId.ip][deviceId.eoj];
    const eojClass = "0x" + deviceId.eoj.substring(0, 4).toUpperCase();
    const deviceType = all.devices.find(_=>_.eoj === eojClass);
    if(deviceType===undefined){
      return undefined;
    }

    //const propertiesValue:{[key:string]:any} = {};

    if((property.epc.substring(2).toLowerCase() in echoNetRawData)===false)
    {
      return undefined;
    }
    const data = echoNetRawData[property.epc.substring(2).toLowerCase()];
    if((deviceType.deviceType in EchoNetConverter)===false)
    {
      return undefined;
    }

    let propertyConverter:Converter<any>|undefined=undefined;
    const commonConverter = (EchoNetConverter as any)["common"] as any;
    if(property.name in commonConverter)
    {
      propertyConverter = commonConverter[property.name] as Converter<any>;
    }
    if(propertyConverter === undefined){
      const deviceConverter = (EchoNetConverter as any)[deviceType.deviceType] as any;
      if(property.name in deviceConverter)
      {
        propertyConverter = deviceConverter[property.name] as Converter<any>;
      }
    }
    if(propertyConverter !== undefined)
    {
      const value = propertyConverter.toValue({
        rootProperty: property,
        schema: property.schema,
        data
      });
      return value;
    }
    else{
      console.dir({name:property.name, data:data ,value:"no converter"})
    }
  }
}

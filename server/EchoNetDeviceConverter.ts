import EL, { facilitiesType } from "echonet-lite";
import { Device, DeviceId, Manufacturer, Property, PropertyValue } from "./Property";
import dayjs from 'dayjs';
import { EchoNetPropertyConverter } from "./EchoNetPropertyConverter";

export default class EchoNetDeviceConverter
{
  private echoNetPropertyConverter:EchoNetPropertyConverter = new EchoNetPropertyConverter();

  public getDeviceIdList =  (echonetLiteFacilities:facilitiesType): DeviceId[] =>{
    const result:DeviceId[] = [];
    for(const ip in echonetLiteFacilities)
    {
      for(const eoj in echonetLiteFacilities[ip]){
        if(("9f" in echonetLiteFacilities[ip][eoj]) === false || 
          ("9e" in echonetLiteFacilities[ip][eoj]) === false || 
          ("9d" in echonetLiteFacilities[ip][eoj]) === false ||
          ("8a" in echonetLiteFacilities[ip][eoj]) ===false)  //メーカコード
        {
          continue;
        }
        const getPropertyNoList = this.convertGetPropertyNoList(ip, eoj, echonetLiteFacilities);
        if(getPropertyNoList === undefined)
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
    return newDevice;
  }


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
    const deviceType = this.echoNetPropertyConverter.getDevice(eojClass);
    if(deviceType === undefined)
    {
      console.log("ERROR class not found.");
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
  
    const set = new Set([...getPropertyNoList, ...setPropertyNoList, ...notifyPropertyNoList]);
    
    const properties:Property[] = [];
    for(const propertyNo of [...set])
    {
      if(propertyNo === "9d" || propertyNo === "9e" || propertyNo === "9f"){
        continue;
      }
      const epc = "0x" + propertyNo.toUpperCase();
  
      const matchedDeviceProperties = deviceType.elProperties
        .filter((_):boolean=>_.epc === epc)
        .map((_):Property=>({
          name:_.shortName,
          descriptions:_.descriptions ?? {ja:"",en:""},
          epc:_.epc,
          readable: false,
          observable:false,
          writable:false,
          schema: _,
        }))
  
      if(matchedDeviceProperties.length !== 0)
      {
        properties.push(matchedDeviceProperties[0]);
        continue;
      }
      console.log(`ERROR: unknown property. propertyNo === ${propertyNo} in eoj:${eoj}`);
    }
    
    for(const propertyNo of getPropertyNoList)
    {
      if(propertyNo === "9d" || propertyNo === "9e" || propertyNo === "9f"){
        continue;
      }
      const epc = "0x" + propertyNo.toUpperCase();
      const matchedProperties = properties.filter((_):boolean=>_.epc === epc);
      if(matchedProperties.length !== 0)
      {
        matchedProperties[0].readable = true;
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
      deviceType: deviceType.shortName,
      descriptions: deviceType.className ?? {ja:"",en:""},
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
  
    // 識別番号を持つ場合で、未取得ならば取得されるまで待つ
    if(getPropertyNoList.find((_):boolean=>_ === "83") !== undefined){
      if("83" in facilities[ip][eoj] === false)
      {
        // 識別番号が未取得なら、取得されるまで待つ
        console.log(`id is not get in ${ip} ${eoj}`);
        return "";
      }
    }

    // getプロパティに無くても識別番号を持つ場合があり、その場合はその値を使う
    if("83" in facilities[ip][eoj])
    {
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
    const foundDevice = this.echoNetPropertyConverter.getDevice(deviceClass);
    if(foundDevice === undefined){
      return undefined;
    }
    
    let property = foundDevice.elProperties.find(_=>_.epc === "0x" + epc.toUpperCase());
    if(property === undefined)
    {
      return undefined;
    }
    return this.getProperty(deviceId, property.shortName);
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
    const foundDevice = this.echoNetPropertyConverter.getDevice(deviceClass);
    if(foundDevice === undefined){
      return undefined;
    }
    
    const foundProperty = foundDevice.elProperties.find(_=>_.shortName === propertyName);
    if(foundProperty === undefined)
    {
      return undefined;
    }
    

    return {
      descriptions: foundProperty.descriptions ?? {ja:"",en:""},
      epc: foundProperty.epc,
      name: foundProperty.shortName,
      readable: false,
      observable: false,
      writable: false,
      schema: foundProperty
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
    const foundDevice = this.echoNetPropertyConverter.getDevice(deviceClass);
    if(foundDevice === undefined){
      console.log(`propertyToEchoNetData foundDevice === undefined`)
      return undefined;
    }
    
    const foundProperty = foundDevice.elProperties.find(_=>_.shortName === propertyName);
    if(foundProperty === undefined)
    {
      console.log(`propertyToEchoNetData deviceProperty === undefined`)
      return undefined;
    }

    const echoNetData = this.echoNetPropertyConverter.toEchoNetLiteData(foundProperty.data, value);
    
    if(echoNetData===undefined){
      console.log(`propertyToEchoNetData echoNetData===undefined`)
      return undefined;
    }

    return echoNetData;
  }

  public getPropertyValue = (deviceId:DeviceId, property:Property): unknown|undefined=>{

    const echoNetRawData = EL.facilities[deviceId.ip][deviceId.eoj];
    if((property.epc.substring(2).toLowerCase() in echoNetRawData)===false)
    {
      return undefined;
    }
    const data = echoNetRawData[property.epc.substring(2).toLowerCase()];

    const value = this.echoNetPropertyConverter.toObject(
      property.schema.data,
      data
    );
    return value;
  }
}
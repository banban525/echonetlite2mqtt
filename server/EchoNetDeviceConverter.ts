import { AliasOption, Device, DeviceAlias, DeviceId, Manufacturer, Property, PropertyValue, Protocol } from "./Property";
import { EchoNetPropertyConverter } from "./EchoNetPropertyConverter";
import { getUtcNowDateTimeText } from "./datetimeLib";
import { RawDataSet } from "./EchoNetCommunicator";
import { Logger } from "./Logger";

export default class EchoNetDeviceConverter
{
  private echoNetPropertyConverter:EchoNetPropertyConverter = new EchoNetPropertyConverter();

  private readonly aliasOption:AliasOption;
  private readonly unknownAsError:boolean;
  public constructor(aliasOption:AliasOption, unknownAsError:boolean)
  {
    this.aliasOption = aliasOption;
    this.unknownAsError = unknownAsError;
  }


  public createDevice = (ip:string, eoj:string, id:string, internalId:string, echonetLiteFacilities:RawDataSet):Device|undefined => {

    const getPropertyNoList = this.convertGetPropertyNoList(ip, eoj, echonetLiteFacilities);
    if(getPropertyNoList === undefined)
    {
      return undefined;
    }

    const manufacturer = this.getManufacturer(ip, eoj, echonetLiteFacilities.getRawData(ip,eoj,"8a")??undefined);
    if(manufacturer === undefined)
    {
      return undefined;
    }

    const protocol = this.echoNetPropertyConverter.getProtocol(echonetLiteFacilities.getRawData(ip, eoj, "82")??"00000000");

    const setPropertyNoList:string[] = [];
    const setPropertyListText = echonetLiteFacilities.getRawData(ip, eoj,"9e") ?? "";
    for(let i = 2; i < setPropertyListText.length; i+=2)
    {
      setPropertyNoList.push(setPropertyListText.substr(i, 2));
    }

    const notifyPropertyNoList:string[] = [];
    const notifyPropertyListText = echonetLiteFacilities.getRawData(ip, eoj, "9d") ?? "";
    for(let i = 2; i < notifyPropertyListText.length; i+=2)
    {
      notifyPropertyNoList.push(notifyPropertyListText.substr(i, 2));
    }

    const newDevice = this.createDevice2(
      id, 
      ip, 
      eoj, 
      internalId,
      getPropertyNoList, 
      setPropertyNoList, 
      notifyPropertyNoList, 
      manufacturer,
      protocol,
      echonetLiteFacilities);
    return newDevice;
  }


  private createDevice2 = (
      id:string, 
      ip:string, 
      eoj:string, 
      internalId:string,
      getPropertyNoList:string[], 
      setPropertyNoList:string[], 
      notifyPropertyNoList:string[],
      manufacturer:Manufacturer, 
      protocol:Protocol,
      echonetLiteFacilities:RawDataSet):Device =>
  {
    const eojClass = "0x" + eoj.substring(0, 4).toUpperCase();
    let deviceType = this.echoNetPropertyConverter.getDevice(eojClass);
    if(deviceType === undefined)
    {
      Logger.info("", `ERROR class not found. EOJ=${eoj}`);
      deviceType = this.echoNetPropertyConverter.createDummyDevice(eoj);

      if(this.unknownAsError)
      {
        return {
          id,
          name:"",
          ip,
          eoj,
          internalId,
          properties:[],
          deviceType:"unknown",
          schema:deviceType,
          descriptions: {
            ja:"不明",
            en:"unknown"
          },
          protocol,
          manufacturer,
          propertiesValue:{}
        };
      }
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
      }
      else
      {
        Logger.warn("", `ERROR: unknown property. propertyNo === ${propertyNo} in id: ${id}, ip:${ip}, eoj:${eoj}`);
        if(this.unknownAsError)
        {
          continue;
        }
        const dummyProperty = this.createDummyProperty(epc);
        properties.push(dummyProperty);
      }
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
    }

    const updated = getUtcNowDateTimeText();
    const propertiesValue:{[key:string]:PropertyValue} = {};
    for(const property of properties){
      const echonetRawData = echonetLiteFacilities.getRawData(ip, eoj, property.epc.substring(2).toLowerCase());
      if(echonetRawData === undefined)
      {
        continue;
      }
      const value = this.echoNetPropertyConverter.toObject(
        property.schema.data,
        echonetRawData
      );
      //const value = this.getPropertyValue(ip, eoj, property);
      propertiesValue[property.name] = {
        name: property.name,
        deviceProperty: property,
        value: value,
        updated: updated
      };
    }

    let name = id;
    const matchedAliases = this.aliasOption.aliases.filter(_=>DeviceAlias.isMatch(_, id, eoj, ip));
    if(matchedAliases.length > 0)
    {
      name = matchedAliases[0].name;
    }

    return {
      id,
      name,
      ip,
      eoj,
      internalId,
      deviceType: deviceType.shortName,
      schema: deviceType,
      descriptions: deviceType.className ?? {ja:"",en:""},
      properties,
      protocol:protocol,
      manufacturer,
      propertiesValue
    }
  }

  private createDummyProperty(epc:string):Property
  {
    let epcNo = epc.toUpperCase();
    epcNo = epcNo.startsWith("0X") ? epcNo.substring(2) : epcNo;

    const propertyDescription = this.echoNetPropertyConverter.createDummyProperty(epcNo);

    return {
      descriptions: propertyDescription.descriptions ?? {ja:"",en:""},
      epc:`0x${epcNo}`,
      name:propertyDescription.shortName,
      observable:false,
      readable:false,
      writable:false,
      schema: propertyDescription
    }
  }
    
  private getManufacturer = (ip:string, eoj:string, rawData:string|undefined):Manufacturer|undefined => {

    if(rawData === undefined)
    {
      return undefined;
    }
    return this.echoNetPropertyConverter.getManufacturer(rawData);
  }
    
    
  public convertGetPropertyNoList = (ip:string, eoj:string, facilities:RawDataSet): string[]|undefined => {
  
    const getPropertyListText = facilities.getRawData(ip, eoj, "9f");
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

  public getDeviceRawId = (ip:string, eoj:string, facilities:RawDataSet):string|undefined => {
    return facilities.getRawData(ip, eoj, "83");
  }
  
  public getDeviceId = (ip:string, eoj:string, facilities:RawDataSet):string => {
    let id = "";
  
    const getPropertyNoList = this.convertGetPropertyNoList(ip, eoj, facilities);
    if(getPropertyNoList === undefined)
    {
      return "";
    }
  
    // 識別番号を持つ場合で、未取得ならば取得されるまで待つ
    if(getPropertyNoList.find((_):boolean=>_ === "83") !== undefined){
      if(facilities.existsData(ip, eoj,"83") === false)
      {
        // 識別番号が未取得なら、取得されるまで待つ
        Logger.warn("", `id is not get in ${ip} ${eoj}`);
        return "";
      }
    }

    // getプロパティに無くても識別番号を持つ場合があり、その場合はその値を使う
    if(facilities.existsData(ip,eoj,"83"))
    {
      id = facilities.getRawData(ip, eoj, "83") ?? "";
    }
    
    // 識別番号が無い機器の場合は、ノードの識別番号+eojにする
    if(id === "")
    {
      if(facilities.existsDevice(ip, "0ef001")===false)
      {
        // ノードが未取得なら、取得されるまで待つ
        Logger.warn("", `node is not found in ${ip} ${"0ef001"}`);
        return "";
      }
      const nodeGetProperty = facilities.getRawData(ip, "0ef001", "9f");
      if(nodeGetProperty === undefined)
      {
        // ノードのプロパティリストが未取得なら、取得されるまで待つ
        Logger.warn("", `node property list are not get in ${ip} ${eoj}`);
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
        const nodeId = facilities.getRawData(ip, "0ef001", "83");
        if(nodeId === undefined)
        {
          // ノードのIDが未取得なら取得されるまで待つ
          Logger.warn("", `node id is not get in ${ip} ${eoj}`);
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

  public getPropertyWithEpc = (ip:string, eoj:string, epc:string): Property|undefined =>{

    // コンバート可能なデバイスかチェック
    const deviceClass = "0x"+eoj.substr(0, 4).toUpperCase();
    const foundDevice = this.echoNetPropertyConverter.getDevice(deviceClass);
    if(foundDevice === undefined){
      return undefined;
    }
    
    let property = foundDevice.elProperties.find(_=>_.epc === "0x" + epc.toUpperCase());
    if(property === undefined)
    {
      return undefined;
    }
    return this.getProperty(ip, eoj, property.shortName);
  }

  public getProperty = (ip:string, eoj:string, propertyName:string): Property|undefined =>{

    // コンバート可能なデバイスかチェック
    const deviceClass = "0x"+eoj.substr(0, 4).toUpperCase();
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

  public propertyToEchoNetData = (ip:string, eoj:string, propertyName:string, value:any):string|undefined => {

    // コンバート可能なデバイスかチェック
    const deviceClass = "0x"+eoj.substr(0, 4).toUpperCase();
    const foundDevice = this.echoNetPropertyConverter.getDevice(deviceClass);
    if(foundDevice === undefined){
      Logger.warn("", `propertyToEchoNetData foundDevice === undefined`)
      return undefined;
    }
    
    const foundProperty = foundDevice.elProperties.find(_=>_.shortName === propertyName);
    if(foundProperty === undefined)
    {
      Logger.warn("", `propertyToEchoNetData deviceProperty === undefined`)
      return undefined;
    }

    const echoNetData = this.echoNetPropertyConverter.toEchoNetLiteData(foundProperty.data, value);
    
    if(echoNetData===undefined){
      Logger.warn("", `propertyToEchoNetData echoNetData===undefined`)
      return undefined;
    }

    return echoNetData;
  }

  public convertPropertyValue = (property: Property, echonetData: string): unknown | undefined =>
  {
    const value = this.echoNetPropertyConverter.toObject(
      property.schema.data,
      echonetData
    );
    return value;
  }

  public convertToSelfNodeInstanceListForNodeProfile(rawData:string):  {numberOfInstances:number, instanceList:string[]} | undefined
  {
    const nodeProfileDeviceType = this.echoNetPropertyConverter.getDevice("0x0EF0");
    if(nodeProfileDeviceType === undefined)
    {
      throw Error("ERROR: Not found nodeProfile device class");
    }
    const instanceListProperty = nodeProfileDeviceType.elProperties.find(_=>_.epc === "0xD6");
    if(instanceListProperty === undefined)
    {
      throw Error("ERROR: Not found Self-node instance list S property class in nodeProfile device class");
    }
    const data = rawData;
    const eojListUnknown = this.echoNetPropertyConverter.toObject(
      instanceListProperty.data,
      data
    ) as {numberOfInstances:number, instanceList:string[]} | undefined;
    return eojListUnknown;
  }

  public convertToPropertyList(rawData:string): string[] | undefined
  {
    if(rawData.length < 2)
    {
      return undefined;
    }
    const result:string[] = [];
    for(let i=2;i<rawData.length;i+=2)
    {
      const epc = rawData.substring(i, i+2).toLowerCase();
      if(epc.match(/[0-9a-f]{2}/) === null)
      {
        return undefined;
      }
      result.push(epc);
    }
    return result;
  }

  public isSupportedDeviceType(eoj:string):boolean
  {
    const eojClass = "0x" + eoj.substring(0, 4).toUpperCase();
    const deviceType = this.echoNetPropertyConverter.getDevice(eojClass);
    return deviceType !== undefined;
  }
}

import { AliasOption, Device, DeviceAlias, DeviceId, Manufacturer, Property, PropertyValue, Protocol } from "./Property";
import { EchoNetPropertyConverter } from "./EchoNetPropertyConverter";
import { getUtcNowDateTimeText } from "./datetimeLib";
import { RawDataSet } from "./EchoNetCommunicator";
import { Logger } from "./Logger";
import { ElDeviceDescription } from "./MraTypes";

export default class EchoNetDeviceConverter
{
  private readonly echoNetPropertyConverter:EchoNetPropertyConverter;
  private readonly aliasOption:AliasOption;
  private readonly unknownAsError:boolean;
  public constructor(aliasOption:AliasOption, unknownAsError:boolean, additionalMraFolders:string[])
  {
    this.aliasOption = aliasOption;
    this.unknownAsError = unknownAsError;
    this.echoNetPropertyConverter = new EchoNetPropertyConverter(additionalMraFolders);
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
  
      const property = this.createProperty(deviceType, epc, protocol);  
      if(property !== undefined)
      {
        properties.push(property);
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

  private createProperty = (deviceType:ElDeviceDescription, epc:string, protocol:Protocol):Property|undefined => {
    
    for(const property of deviceType.elProperties)
    {
      if(property.epc !== epc)
      {
        continue;
      }

      // latestはとりあえずZの次のASCIIコードである'['にしてしまう
      const releaseFrom = property.validRelease.from === "latest" ? "[" : property.validRelease.from;
      const releaseTo = property.validRelease.to === "latest" ? "[" : property.validRelease.to;
      if(releaseFrom <= protocol.appendix.release  && protocol.appendix.release <= releaseTo)
      {
        return {
          name:property.shortName,
          descriptions:property.descriptions ?? {ja:"",en:""},
          epc:property.epc,
          readable: false,
          observable:false,
          writable:false,
          schema: property,
        };
      }
    }

    return undefined;
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

  public propertyToEchoNetData = (property:Property, value:any):string|undefined => {

    const echoNetData = this.echoNetPropertyConverter.toEchoNetLiteData(property.schema.data, value);
    
    if(echoNetData===undefined){
      Logger.warn("[propertyToEchoNetData]", `echoNetData===undefined`)
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

}

import { eldata,rinfo } from "echonet-lite";
import os from "os";
import ip from "ip";
import { AliasOption, Device, DeviceId } from "./Property";
import EchoNetDeviceConverter from "./EchoNetDeviceConverter";
import { EchoNetLiteRawController } from "./EchoNetLiteRawController";
import { EchoNetHoldController } from "./EchoNetHoldController";
import { HoldOption } from "./MqttController";
import { ELSV } from "./EchoNetCommunicator";
import { Logger } from "./Logger";


export class EchoNetLiteController{
  
  private readonly aliasOption: AliasOption;
  private readonly echonetLiteRawController:EchoNetLiteRawController;
  private readonly holdController:EchoNetHoldController;
  private readonly deviceConverter:EchoNetDeviceConverter;
  private readonly controllerDeviceDefine:{[key: string]: { [key: string]: number[] }};
  private readonly usedIpByEchoNet:string;
  private readonly legacyMultiNicMode:boolean;
  private readonly unknownAsError:boolean;
  private readonly knownDeviceIpList:string[];
  private readonly searchDevices:boolean
  constructor(echonetTargetNetwork:string,  
    aliasOption: AliasOption, 
    legacyMultiNicMode:boolean, 
    unknownAsError:boolean,
    knownDeviceIpList:string[],
    searchDevices:boolean)
  {
    this.aliasOption = aliasOption;
    this.deviceConverter = new EchoNetDeviceConverter(this.aliasOption, unknownAsError);
    this.echonetLiteRawController = new EchoNetLiteRawController();
    this.holdController = new EchoNetHoldController({request:this.requestDeviceProperty, set:this.setDevicePropertyPrivate, isBusy:()=>this.echonetLiteRawController.getSendQueueLength() >= 1});
    this.legacyMultiNicMode = legacyMultiNicMode;
    this.unknownAsError = unknownAsError;
    this.knownDeviceIpList = knownDeviceIpList;
    this.searchDevices = searchDevices;

    this.usedIpByEchoNet = "";
    if (echonetTargetNetwork.match(/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+\/[0-9]+/)) {
      const interfaces = os.networkInterfaces();
      const matchedNetworkAddresses = Object.keys(interfaces)
        .map((key) => interfaces[key])
        .flat()
        .filter((_) => _!==undefined && ip.cidrSubnet(echonetTargetNetwork).contains(_.address));
      
      if(matchedNetworkAddresses.length >= 1)
      {
        this.usedIpByEchoNet = matchedNetworkAddresses[0]?.address ?? "";
      }
    }

    this.echonetLiteRawController.addReveivedHandler(( rinfo:rinfo, els:eldata ):void=>{
      if(els.ESV === ELSV.SET_RES)
      {
        this.ReceivedSetResponse(rinfo,els);
      }
      if(els.ESV === ELSV.GET_RES)
      {
        this.ReceivedGetResponse(rinfo,els);
      }
  
      // GETエラーだが、一部のプロパティは受信できているので、GetResponseとして扱う
      if(els.ESV === ELSV.GET_SNA)
      {
        this.ReceivedGetResponse(rinfo,els);
      }
      if(els.ESV === ELSV.INF)
      {
        this.ReceivedInfo(rinfo,els);
      }
      if(els.ESV === ELSV.SETC || els.ESV === ELSV.SETI)
      {
        this.ReceivedSet(rinfo,els);
      }
      if(els.ESV === ELSV.GET)
      {
        this.ReceivedGet(rinfo,els);
      }
      
    });

    this.echonetLiteRawController.addDeviceDetectedEvent(this.deviceDetected);
    this.echonetLiteRawController.addPropertyChangedHandler(this.propertyChnaged);

    // コントローラー
    this.controllerDeviceDefine = {
      '05ff01': {
        // super
        "80": [0x30],  // 動作状態
        "81": [0xff],  // 設置場所
        "82": [0x00, 0x00, 0x50, 0x00], // EL version, Release P
        '83': [0xfe, 0xff, 0xff, 0xfe, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02], // identifier
        "88": [0x42],  // 異常状態
        "8a": [0xff, 0xff, 0xfe], // maker code
        "9d": [0x00],        // inf map
        "9e": [0x00],        // set map
        "9f": [0x09, 0x80, 0x81, 0x82, 0x83, 0x88, 0x8a, 0x9d, 0x9e, 0x9f], // get map
      }
    };
  }

  private propertyChnaged = (ip:string, eoj:string, epc:string, oldValue:string, newValue:string):void=>
  {
    const deviceId = this.detectedDeviceIdList.find(_=>_.ip === ip &&  _.eoj === eoj);
    if(deviceId===undefined){
      return;
    }
    const property = this.deviceConverter.getPropertyWithEpc(deviceId, epc);
    if(property===undefined){
      return;
    }

    const value = this.deviceConverter.convertPropertyValue(property, newValue);
    if(value === undefined)
    {
      return;
    }
    this.firePropertyChnagedEvent(deviceId, property.name, value);
  }

  readonly detectedDeviceIdList:DeviceId[] = [];
  private deviceDetected = (deviceKeys:{ip:string, eoj:string}[]):void =>
  {
    const detectedDevices:Device[] = [];
    const rawDataSet = this.echonetLiteRawController.getRawDataSet();
    for(const deviceKey of deviceKeys)
    {
      if(this.detectedDeviceIdList.find(_=>_.id === deviceKey.ip && _.eoj === deviceKey.eoj) !== undefined)
      {
        continue;
      }

      let id="";
      if(deviceKey.eoj === "0ef001")
      {
        id = this.deviceConverter.getDeviceIdForNodeProfile(rawDataSet, deviceKey.ip);
      }
      else
      {
        id = this.deviceConverter.getDeviceId(deviceKey.ip, deviceKey.eoj, rawDataSet);
      }
      if(id === undefined)
      {
        continue;
      }
      const deviceId:DeviceId = {...deviceKey, id};
      const device = this.deviceConverter.createDevice(deviceId, rawDataSet);
      if(device === undefined)
      {
        continue;
      }
      this.detectedDeviceIdList.push(deviceId);
      detectedDevices.push(device);
    }

    for(const device of detectedDevices)
    {
      this.fireDeviceDetected(device);
    }
  }

  private ReceivedSetResponse = ( rinfo:rinfo, els:eldata ):void=>
  {
  };

  private ReceivedGetResponse = async ( rinfo:rinfo, els:eldata ):Promise<void>=>
  {

  };
  ReceivedInfo = ( rinfo:rinfo, els:eldata ):void=>
  {
  
  };
  ReceivedGet = (( rinfo:rinfo, els:eldata ):void=>
  {
    if(els.DEOJ === "05ff01")
    {
      this.echonetLiteRawController.replyGetDetail(rinfo, els, this.controllerDeviceDefine );
    }
  });
  ReceivedSet = (( rinfo:rinfo, els:eldata ):void=>
  {
    if(els.DEOJ === "05ff01")
    {
      this.echonetLiteRawController.replySetDetail(rinfo, els, this.controllerDeviceDefine );
    }
  });

  getDevice = (id:DeviceId):Device|undefined => 
  {
    const device = this.deviceConverter.createDevice(id, this.echonetLiteRawController.getRawDataSet());
    return device;
  }

  propertyChnagedListeners:((id:DeviceId, propertyName:string, newValue:any)=>void)[] = [];
  addPropertyChnagedEvent = (event:(id:DeviceId, propertyName:string, newValue:any)=>void)=>
  {
    this.propertyChnagedListeners.push(event);
  }
  firePropertyChnagedEvent = (id:DeviceId, propertyName:string, newValue:any):void=>
  {
    this.propertyChnagedListeners.forEach((_)=>_(id, propertyName, newValue));
  }
  
  deviceDetectedListeners:((device:Device)=>void)[] = [];
  addDeviceDetectedEvent = (event:(device:Device)=>void):void =>{
    this.deviceDetectedListeners.push(event);
  }
  fireDeviceDetected = (device:Device):void=>{
    this.deviceDetectedListeners.forEach(_=>_(device));
  }

  setDeviceProperty = async (id:DeviceId, propertyName:string, newValue:any, holdOption:HoldOption|undefined=undefined):Promise<void> =>
  {
    if(holdOption===undefined)
    {
      holdOption = HoldOption.empty;
    }

    await this.setDevicePropertyPrivate(id, propertyName, newValue);

    if(holdOption.holdTime > 0)
    {
      this.holdController.setHold(id, propertyName, newValue, holdOption);
    }
    else
    {
      this.holdController.clearHold(id, propertyName);
    }
  };

  setDevicePropertyPrivate = async (id:DeviceId, propertyName:string, newValue:any):Promise<void> =>
  {
    const property = this.deviceConverter.getProperty(id.ip, id.eoj, propertyName);


    const echoNetData = this.deviceConverter.propertyToEchoNetData(id.ip, id.eoj, propertyName, newValue);
    if(echoNetData===undefined)
    {
      Logger.warn("[ECHONETLite]", `setDeviceProperty echoNetData===undefined newValue=${newValue}`);
      return;
    }
    if(property === undefined)
    {
      Logger.warn("[ECHONETLite]", `setDeviceProperty property === undefined propertyName=${propertyName}`);
      return;
    }
    let epc = property.epc.toLowerCase();
    if(epc.startsWith("0x"))
    {
      epc = epc.replace(/^0x/gi, "");
    }
    {
      const res = await this.echonetLiteRawController.execPromise({
        ip:id.ip, 
        seoj:"05ff01", 
        deoj:id.eoj, 
        esv: ELSV.SETC, 
        epc, 
        edt:echoNetData,
        tid:""});
      if(res.responses[0].els.ESV !== ELSV.SET_RES)
      {
        Logger.warn("[ECHONETLite]", `setDeviceProperty res.responses[0].els.ESV !== ELSV.SET_RES`);
        return;
      }
    }
    {
      const res = await this.echonetLiteRawController.execPromise({
        ip:id.ip, 
        seoj:"05ff01", 
        deoj:id.eoj, 
        esv: ELSV.GET, 
        epc, 
        edt:"",
        tid:""});
      if(res.responses[0].els.ESV === ELSV.GET_RES)
      {
        const value = this.deviceConverter.convertPropertyValue(property, res.responses[0].els.DETAILs[epc]);
        if(value === undefined)
        {
          return;
        }
        this.firePropertyChnagedEvent(id, property.name, value);
        this.holdController.receivedProperty(id, property.name, value);
      }
    }
  }

  start = async ():Promise<void>=>
  {
    await this.echonetLiteRawController.initilize(
      Object.keys(this.controllerDeviceDefine),
      this.usedIpByEchoNet,
      this.legacyMultiNicMode
    );

    this.controllerDeviceDefine['05ff01']['83'] = this.echonetLiteRawController.updateidentifierFromMacAddress(this.controllerDeviceDefine['05ff01']['83']);

    await (new Promise<void>((resolve)=>setTimeout(()=>resolve(), 1000)));

    if(this.knownDeviceIpList.length > 0)
    {
      for(const ip of this.knownDeviceIpList)
      {
        Logger.info("[ECHONETLite]", `collecting devices from ${ip}`);
        await this.echonetLiteRawController.searchDeviceFromIp(ip);
      }
      Logger.info("[ECHONETLite]", `done collecting devices`);
    }
    if(this.searchDevices)
    {
      Logger.info("[ECHONETLite]", `searching devices...`);
      await this.echonetLiteRawController.searchDevicesInNetwork();
      Logger.info("[ECHONETLite]", `done searching devices`);
    }
  }

  requestDeviceProperty = async (id:DeviceId, propertyName:string):Promise<void> =>
  {
    const property = this.deviceConverter.getProperty(id.ip, id.eoj, propertyName);
    if(property === undefined)
    {
      Logger.warn("[ECHONETLite]", `setDeviceProperty property === undefined propertyName=${propertyName}`);
      return;
    }

    let epc = property.epc.toLowerCase();
    if(epc.startsWith("0x"))
    {
      epc = epc.replace(/^0x/gi, "");
    }
    const res = await this.echonetLiteRawController.execPromise({
      ip:id.ip, 
      seoj:"05ff01", 
      deoj:id.eoj, 
      esv: ELSV.GET, 
      epc, 
      edt:"",
      tid:""});

    if(res.responses[0].els.ESV === ELSV.GET_RES)
    {
      const value = this.deviceConverter.convertPropertyValue(property, res.responses[0].els.DETAILs[epc]);
      if(value === undefined)
      {
        return;
      }
      this.firePropertyChnagedEvent(id, property.name, value);
    }
  }

  public getRawData = ():unknown=>
  {
    return this.echonetLiteRawController.getRawDataSet();
  }

  public getInternalStatus = ():unknown=>
  {
    return {
      hold: this.holdController.getInternalStatus(),
      rawController: this.echonetLiteRawController.getInternalStatus(),
    }
  }
}

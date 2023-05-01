import { eldata,facilitiesType,rinfo } from "echonet-lite";
import os from "os";
import ip from "ip";
import { AliasOption, Device, DeviceAlias, DeviceId } from "./Property";
import EchoNetDeviceConverter from "./EchoNetDeviceConverter";
import { EchoNetLiteRawController } from "./EchoNetLiteRawController";
import { EchoNetHoldController } from "./EchoNetHoldController";
import { HoldOption } from "./MqttController";
import { EchoNetCommunicator, ELSV } from "./EchoNetCommunicator";


export class EchoNetLiteController{
  
  private readonly aliasOption: AliasOption;
  private readonly echonetLiteRawController:EchoNetLiteRawController;
  private readonly holdController:EchoNetHoldController;
  private readonly deviceConverter:EchoNetDeviceConverter;
  private readonly controllerDeviceDefine:{[key: string]: { [key: string]: number[] }};
  constructor(echonetTargetNetwork:string, intervalToGetProperties:number, aliasOption: AliasOption)
  {
    this.aliasOption = aliasOption;
    this.deviceConverter = new EchoNetDeviceConverter(this.aliasOption);
    this.echonetLiteRawController = new EchoNetLiteRawController(this.deviceConverter);
    this.holdController = new EchoNetHoldController({request:this.requestDeviceProperty, set:this.setDevicePropertyPrivate, isBusy:()=>EchoNetCommunicator.getSendQueueLength() >= 1});

    let usedIpByEchoNet = "";
    if (echonetTargetNetwork.match(/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+\/[0-9]+/)) {
      const interfaces = os.networkInterfaces();
      const matchedNetworkAddresses = Object.keys(interfaces)
        .map((key) => interfaces[key])
        .flat()
        .filter((_) => _!==undefined && ip.cidrSubnet(echonetTargetNetwork).contains(_.address));
      
      if(matchedNetworkAddresses.length >= 1)
      {
        usedIpByEchoNet = matchedNetworkAddresses[0]?.address ?? "";
      }
    }
    EchoNetCommunicator.addSetResponseHandler(this.ReceivedSetResponse);
    EchoNetCommunicator.addGetResponseHandler(this.ReceivedGetResponse);
    EchoNetCommunicator.addInfoHandler(this.ReceivedInfo);
    EchoNetCommunicator.addGetHandler(this.ReceivedGet);
    EchoNetCommunicator.addSetHandler(this.ReceivedSet);
    EchoNetCommunicator.addReveivedHandler(( rinfo:rinfo, els:eldata ):void=>{
      this.echonetLiteRawController.reveivePacketProc(rinfo, els);
    });

    this.echonetLiteRawController.addDeviceDetectedEvent(this.fireDeviceDetected);
    this.echonetLiteRawController.start();

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
    
    const a = EchoNetCommunicator.initialize(Object.keys(this.controllerDeviceDefine), 4, {v4:usedIpByEchoNet, autoGetDelay:intervalToGetProperties, autoGetProperties:true});
    a.then(()=>{
      this.controllerDeviceDefine['05ff01']['83'] = EchoNetCommunicator.updateidentifierFromMacAddress(this.controllerDeviceDefine['05ff01']['83']);
    });
  }

  private ReceivedSetResponse = ( rinfo:rinfo, els:eldata ):void=>
  {
  };

  private ReceivedGetResponse = ( rinfo:rinfo, els:eldata ):void=>
  {
    const deviceId = this.echonetLiteRawController.getAllDeviceIds().find(_=>_.ip === rinfo.address &&  _.eoj === els.SEOJ);
    if(deviceId===undefined){
      return;
    }
    for(const propertyCode in els.DETAILs)
    {
      const property = this.deviceConverter.getPropertyWithEpc(deviceId, propertyCode);
      if(property===undefined){
        continue;
      }
      const value = this.deviceConverter.getPropertyValue(deviceId, property);
      this.firePropertyChnagedEvent(deviceId, property.name, value);
      this.holdController.receivedProperty(deviceId, property.name, value);
    }
  };
  ReceivedInfo = ( rinfo:rinfo, els:eldata ):void=>
  {
    const deviceId = this.echonetLiteRawController.getAllDeviceIds().find(_=>_.ip === rinfo.address &&  _.eoj === els.SEOJ);
    if(deviceId===undefined){
      return;
    }
    for(const propertyCode in els.DETAILs)
    {
      const property = this.deviceConverter.getPropertyWithEpc(deviceId, propertyCode);
      if(property===undefined){
        continue;
      }
      const value = this.deviceConverter.getPropertyValue(deviceId, property);
      this.firePropertyChnagedEvent(deviceId, property.name, value);
    }
  };
  ReceivedGet = (( rinfo:rinfo, els:eldata ):void=>
  {
    if(els.DEOJ === "05ff01")
    {
      EchoNetCommunicator.replyGetDetail(rinfo, els, this.controllerDeviceDefine );
    }
  });
  ReceivedSet = (( rinfo:rinfo, els:eldata ):void=>
  {
    if(els.DEOJ === "05ff01")
    {
      EchoNetCommunicator.replySetDetail(rinfo, els, this.controllerDeviceDefine );
    }
  });

  getDetectedDeviceIds = ():DeviceId[]=>
  {
    return this.echonetLiteRawController.getAllDeviceIds();
  }

  getDevice = (id:DeviceId):Device|undefined => 
  {
    const deviceConverter = new EchoNetDeviceConverter(this.aliasOption);

    const device = deviceConverter.createDevice(id, EchoNetCommunicator.getFacilities());
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
  
  deviceDetectedListeners:(()=>void)[] = [];
  addDeviceDetectedEvent = (event:()=>void):void =>{
    this.deviceDetectedListeners.push(event);
  }
  fireDeviceDetected = ():void=>{
    this.deviceDetectedListeners.forEach(_=>_());
  }

  setDeviceProperty = (id:DeviceId, propertyName:string, newValue:any, holdOption:HoldOption|undefined=undefined):void =>
  {
    if(holdOption===undefined)
    {
      holdOption = HoldOption.empty;
    }

    this.setDevicePropertyPrivate(id, propertyName, newValue);

    if(holdOption.holdTime > 0)
    {
      this.holdController.setHold(id, propertyName, newValue, holdOption);
    }
    else
    {
      this.holdController.clearHold(id, propertyName);
    }
  };

  setDevicePropertyPrivate = (id:DeviceId, propertyName:string, newValue:any):void =>
  {
    const deviceConverter = new EchoNetDeviceConverter(this.aliasOption);
    const property = deviceConverter.getProperty(id, propertyName);


    const echoNetData = deviceConverter.propertyToEchoNetData(id, propertyName, newValue);
    if(echoNetData===undefined)
    {
      console.log(`setDeviceProperty echoNetData===undefined newValue=${newValue}`);
      return;
    }
    if(property === undefined)
    {
      console.log(`setDeviceProperty property === undefined propertyName=${propertyName}`);
      return;
    }
    let epc = property.epc;
    if(epc.toLowerCase().startsWith("0x"))
    {
      epc = epc.replace(/^0x/gi, "");
    }
    EchoNetCommunicator.send(id.ip, "05ff01", id.eoj, ELSV.SETC, epc, echoNetData);
  }

  start = ():void=>
  {
    EchoNetCommunicator.search();
  }

  requestDeviceProperty = (id:DeviceId, propertyName:string):void =>
  {
    const deviceConverter = new EchoNetDeviceConverter(this.aliasOption);
    const property = deviceConverter.getProperty(id, propertyName);
    if(property === undefined)
    {
      console.log(`setDeviceProperty property === undefined propertyName=${propertyName}`);
      return;
    }

    let epc = property.epc;
    if(epc.toLowerCase().startsWith("0x"))
    {
      epc = epc.replace(/^0x/gi, "");
    }
    EchoNetCommunicator.send(id.ip, "05ff01", id.eoj, ELSV.GET, epc, [0x00]);
  }

  public getRawData = ():unknown=>
  {
    return EchoNetCommunicator.getFacilities();
  }

  public getInternalStatus = ():unknown=>
  {
    return {
      hold: this.holdController.getInternalStatus(),
      rawController: this.echonetLiteRawController.getInternalStatus()
    }
  }
}

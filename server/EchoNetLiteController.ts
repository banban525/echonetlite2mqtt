import { eldata,rinfo } from "echonet-lite";
import { AliasOption, Device, DeviceId } from "./Property";
import EchoNetDeviceConverter from "./EchoNetDeviceConverter";
import { EchoNetLiteRawController } from "./EchoNetLiteRawController";
import { EchoNetHoldController } from "./EchoNetHoldController";
import { HoldOption } from "./MqttController";
import { ELSV } from "./EchoNetCommunicator";
import { Logger } from "./Logger";

export type findDeviceCallback = (internalId:string)=>Device|undefined;

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
  private readonly searchDevices:boolean;
  private readonly commandTimeout:number;
  private readonly findDeviceCallback:findDeviceCallback;
  constructor(usedIpByEchoNet:string,  
    aliasOption: AliasOption, 
    legacyMultiNicMode:boolean, 
    unknownAsError:boolean,
    knownDeviceIpList:string[],
    searchDevices:boolean,
    commandTimeout:number,
    findDeviceCallback:findDeviceCallback)
  {
    this.aliasOption = aliasOption;
    this.deviceConverter = new EchoNetDeviceConverter(this.aliasOption, unknownAsError);
    this.echonetLiteRawController = new EchoNetLiteRawController();
    this.holdController = new EchoNetHoldController({request:this.requestDeviceProperty, set:this.setDevicePropertyPrivate, isBusy:()=>this.echonetLiteRawController.getSendQueueLength() >= 1});
    this.legacyMultiNicMode = legacyMultiNicMode;
    this.unknownAsError = unknownAsError;
    this.knownDeviceIpList = knownDeviceIpList;
    this.searchDevices = searchDevices;

    this.usedIpByEchoNet = usedIpByEchoNet;
    this.commandTimeout = commandTimeout;
    this.findDeviceCallback = findDeviceCallback;

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
    const property = this.deviceConverter.getPropertyWithEpc(ip, eoj, epc);
    if(property===undefined){
      return;
    }

    const value = this.deviceConverter.convertPropertyValue(property, newValue);
    if(value === undefined)
    {
      return;
    }
    this.firePropertyChnagedEvent(ip, eoj, property.name, value);
  }
  
  // ノード単位で見つかったデバイスのEOJリストが通知されるので
  // EchonetLite2MQTT用のデバイスを作る
  // デバイスのIdは、echonetの識別番号(識別番号が無い場合はnodeProfileの識別番号+"_(eoj)")を使っていたが
  // echonetの識別番号はノード内で重複する場合があるので、その場合は識別番号_eojの形にする
  // 本当は、常に識別番号_eojまたはnodeProfile識別番号_eojの形にしたほうが一意性がありそうだが、
  // 過去バージョンとの互換性のためにidの決定ルールを維持する
  private deviceDetected = (ip:string, eojList:string[]):void =>
  {
    const rawDataSet = this.echonetLiteRawController.getRawDataSet();

    const nodeProfileId = this.deviceConverter.getDeviceRawId(ip, "0ef001", rawDataSet);
    // ノードプロファイルのIdは常に存在するはず。無ければ未取得なので何もしない
    if(nodeProfileId === undefined || nodeProfileId === "")
    {
      return;
    }

    const deviceIdsTemp:{eoj:string, id:string}[] = [];
    for(const eoj of eojList)
    {
      let id="";
      id = this.deviceConverter.getDeviceId(ip, eoj, rawDataSet);

      if(id === undefined || id === "")
      {
        continue;
      }
      deviceIdsTemp.push({eoj, id});
    }

    // idが重複している場合は、id_eojの形にする
    // ただし、idの重複がnodeProfileともう1つだけなら、nodeProfileのみid_eojの形にする
    const deviceIds:{eoj:string, id:string}[] = [];
    for(let i = 0; i<deviceIdsTemp.length; i++)
    {
      const deviceId = deviceIdsTemp[i];
      const matchedDeviceIds = deviceIdsTemp.filter(_=>_.id === deviceId.id);
      if(matchedDeviceIds.length <= 1)
      {
        deviceIds.push(deviceId);
      }
      else if(matchedDeviceIds.length === 2 && 
        matchedDeviceIds.find(_=>_.eoj === "0ef001") !== undefined)
      {
        if(deviceId.eoj !== "0ef001")
        {
          deviceIds.push(deviceId);
        }
        else
        {
          deviceIds.push({eoj:deviceId.eoj, id:`${deviceId.id}_${deviceId.eoj}`});
        }
      }
      else
      {
        deviceIds.push({eoj:deviceId.eoj, id:`${deviceId.id}_${deviceId.eoj}`});
      }
    }

    // デバイスIdからデバイスを作成
    const detectedDevices:Device[] = [];
    const updateDevices:{current:Device, new:Device}[] = [];
    for(const deviceId of deviceIds)
    {
      let internalId = nodeProfileId + "_" + deviceId.eoj;

      const currentDevice = this.findDeviceCallback(internalId);
      if(currentDevice===undefined)
      {
        const device = this.deviceConverter.createDevice(ip, deviceId.eoj, deviceId.id, internalId, rawDataSet);
        if(device === undefined)
        {
          // デバイスが作成できない場合は、必須プロパティが足りていないので、中止する
          Logger.warn("[ECHONETLite]", `deviceDetected: cannot create new device: ${ip} ${deviceId.eoj}`);
          return;
        }
        detectedDevices.push(device);
        continue;
      }
      if(currentDevice.id !== deviceId.id || 
        currentDevice.ip !== ip ||
        currentDevice.eoj !== deviceId.eoj)
      {
        const device = this.deviceConverter.createDevice(ip, deviceId.eoj, deviceId.id, internalId, rawDataSet);
        if(device === undefined)
        {
          // デバイスが作成できない場合は、必須プロパティが足りていないので、中止する
          Logger.warn("[ECHONETLite]", `deviceDetected: cannot recreate a device: ${ip} ${deviceId.eoj}`);
          continue;
        }
        updateDevices.push({current:currentDevice, new:device});
      }
    }

    // イベントを通知する
    for(const device of detectedDevices)
    {
      this.fireDeviceDetected(device);
    }
    for(const device of updateDevices)
    {
      this.fireDeviceUpdated(device.current, device.new);
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

  propertyChnagedListeners:((ip:string, eoj:string, propertyName:string, newValue:any)=>void)[] = [];
  addPropertyChnagedEvent = (event:(ip:string, eoj:string, propertyName:string, newValue:any)=>void)=>
  {
    this.propertyChnagedListeners.push(event);
  }
  firePropertyChnagedEvent = (ip:string, eoj:string, propertyName:string, newValue:any):void=>
  {
    this.propertyChnagedListeners.forEach((_)=>_(ip, eoj, propertyName, newValue));
  }
  
  deviceDetectedListeners:((device:Device)=>void)[] = [];
  addDeviceDetectedEvent = (event:(device:Device)=>void):void =>{
    this.deviceDetectedListeners.push(event);
  }
  fireDeviceDetected = (device:Device):void=>{
    this.deviceDetectedListeners.forEach(_=>_(device));
  }
  
  deviceUpdatedListeners:((lastDevice:Device, device:Device)=>void)[] = [];
  addDeviceUpdatedEvent = (event:(lastDevice:Device, device:Device)=>void):void =>{
    this.deviceUpdatedListeners.push(event);
  }
  fireDeviceUpdated = (lastDevice:Device, device:Device):void=>{
    this.deviceUpdatedListeners.forEach(_=>_(lastDevice, device));
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
      
      const response = res.matchResponse(_=>_.els.ESV === ELSV.SET_RES);
      if(response === undefined)
      {
        Logger.warn("[ECHONETLite]", `error setDeviceProperty ${res.command.ip} ${res.command.deoj} ${res.command.epc}`, {responses:res.responses, command:res.command});
        return;
      }
    }
    {
      let res = await this.echonetLiteRawController.execPromise({
        ip:id.ip, 
        seoj:"05ff01", 
        deoj:id.eoj, 
        esv: ELSV.GET, 
        epc, 
        edt:"",
        tid:""});
      let response = res.matchResponse(_=>_.els.ESV === ELSV.GET_RES && (epc in _.els.DETAILs));
      if(response === undefined)
      {
        // リトライする
        Logger.warn("[ECHONETLite]", `setDeviceProperty: retry get property value. epc=${epc}`, {responses:res.responses, command:res.command});
        res = await this.echonetLiteRawController.execPromise({
          ip:id.ip, 
          seoj:"05ff01", 
          deoj:id.eoj, 
          esv: ELSV.GET, 
          epc, 
          edt:"",
          tid:""});

          response = res.matchResponse(_=>_.els.ESV === ELSV.GET_RES && (epc in _.els.DETAILs));
      }
      if(response === undefined)
      {
        Logger.warn("[ECHONETLite]", `setDeviceProperty: cannot get value after set. epc=${epc}`, {responses:res.responses, command:res.command});
        return;
      }

      {
        const value = this.deviceConverter.convertPropertyValue(property, response.els.DETAILs[epc]);
        if(value === undefined)
        {
          return;
        }
        this.firePropertyChnagedEvent(id.ip, id.eoj, property.name, value);
        this.holdController.receivedProperty(id, property.name, value);
      }

    }
  }

  start = async ():Promise<void>=>
  {
    await this.echonetLiteRawController.initilize(
      Object.keys(this.controllerDeviceDefine),
      this.usedIpByEchoNet,
      this.legacyMultiNicMode,
      this.commandTimeout
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
    let res = await this.echonetLiteRawController.execPromise({
      ip:id.ip, 
      seoj:"05ff01", 
      deoj:id.eoj, 
      esv: ELSV.GET, 
      epc, 
      edt:"",
      tid:""});
    let response = res.matchResponse(_=>_.els.ESV === ELSV.GET_RES && (epc in _.els.DETAILs));
    if(response === undefined)
    {
      // リトライする
      Logger.warn("[ECHONETLite]", `requestDeviceProperty: retry get property value. epc=${epc}`, {responses:res.responses, command:res.command});
      res = await this.echonetLiteRawController.execPromise({
        ip:id.ip, 
        seoj:"05ff01", 
        deoj:id.eoj, 
        esv: ELSV.GET, 
        epc, 
        edt:"",
        tid:""});
      response = res.matchResponse(_=>_.els.ESV === ELSV.GET_RES && (epc in _.els.DETAILs));
    }
    if(response === undefined)
    {
      Logger.warn("[ECHONETLite]", `requestDeviceProperty: cannot get property value. epc=${epc}`, {responses:res.responses, command:res.command});
      return;
    }

    {
      const value = this.deviceConverter.convertPropertyValue(property, response.els.DETAILs[epc]);
      if(value === undefined)
      {
        return;
      }
      this.firePropertyChnagedEvent(id.ip, id.eoj, property.name, value);
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

import { eldata, rinfo } from "echonet-lite";
import { toUtcDateTimeText } from "./datetimeLib";
import { EchoNetCommunicator, ELSV } from "./EchoNetCommunicator";
import EchoNetDeviceConverter from "./EchoNetDeviceConverter";
import { Logger } from "./Logger";
import { DeviceId } from "./Property";


export class EchoNetLiteRawController
{
  readonly echoNetDeviceConverter:EchoNetDeviceConverter;
  private echoNetRawStatus:EchoNetRawStatus = {devices:{},nodes:{},searchRetryCount:0};
  constructor(echoNetDeviceConverter:EchoNetDeviceConverter)
  {
    this.echoNetDeviceConverter = echoNetDeviceConverter;
  }

  public start():void
  {
    setInterval(()=>{
      this.retryGetDevice(this.echoNetRawStatus);
    }, 3000);

    setInterval(()=>{
      this.findDevice(this.echoNetRawStatus);
    }, 1000);
  }

  notGetProperties:{[key:string]:EchoNetRawProperty}={};

  public reveivePacketProc( rinfo:rinfo, els:eldata ):void
  {
    // echonet-lite.jsをバージョンアップしたことで、いろいろ挙動が変わってしまったので
    // ここで回避用の処理を行う。
    // autoGetPropertiesで、まとめてプロパティが取得されるようになったことで
    // (1)取得エラーが返ることがある、(2)全部のプロパティが取得されない、という症状が起こっている
    // 全部のプロパティが取得されたかを確認するようにして、未取得だったら再取得を行うようにした。
    // (1)の取得エラーは、EchoNetCommunicatorで、GET_SNAもGET_RES扱いにすることにした。
    // このクラスは間に合わせの処理ばかりなので、一度整理したい。

    if(els.ESV === ELSV.INF)
    {
      // INFの NodeProfile のd5(インスタンスリスト通知) では、NodeProfileの必須プロパティを取得する
      if(els.SEOJ.startsWith("0ef0") && "d5" in els.DETAILs)
      {
        const ip = rinfo.address;
        const eoj = els.SEOJ;
        this.notGetProperties[`${ip}-${eoj}-9d`] = {ip, eoj, propertyCode:"9d"};
        this.notGetProperties[`${ip}-${eoj}-9e`] = {ip, eoj, propertyCode:"9e"};
        this.notGetProperties[`${ip}-${eoj}-9f`] = {ip, eoj, propertyCode:"9f"};
      }
    }
    if(els.ESV === ELSV.GET_RES || els.ESV === ELSV.GET_SNA)
    {
      // GET_RESの NodeProfile のd6(自ノードインスタンスリストS) では、各インスタンスの必須プロパティを取得する
      if(els.SEOJ.startsWith("0ef0") &&  "d6" in els.DETAILs)
      {
        let fiveSecondsLater = new Date();
        fiveSecondsLater.setSeconds(fiveSecondsLater.getSeconds() + 5);
        const expire = toUtcDateTimeText(fiveSecondsLater);

        // このノードのインスタンスの必須プロパティを取得するはず。
        // ただし、無限ループになるかもしれないので、ノードプロファイルはリトライから外す
        const ip = rinfo.address;
        const eoj = els.SEOJ;
        const selfNodeInstanceListSProperty = this.echoNetDeviceConverter.getProperty(ip, eoj, "selfNodeInstanceListS");
        if(selfNodeInstanceListSProperty === undefined)
        {
          return;
        }
        const selfNodeInstanceListS = this.echoNetDeviceConverter.getPropertyValue(
          ip, eoj, 
          selfNodeInstanceListSProperty) as {numberOfInstances:number, instanceList:string[]};
        selfNodeInstanceListS.instanceList.filter(_=>_.startsWith("0ef0")===false).forEach(eoj=>{
          this.notGetProperties[`${ip}-${eoj}-9d`] = {ip, eoj, propertyCode:"9d"};
          this.notGetProperties[`${ip}-${eoj}-9e`] = {ip, eoj, propertyCode:"9e"};
          this.notGetProperties[`${ip}-${eoj}-9f`] = {ip, eoj, propertyCode:"9f"};  
        });
      }

      // ノードプロファイルから9fのGet_Resが来た場合
      // 前バージョンではd6を要求して、その後インスタンスの情報取得が始まっていたが
      // それが最近のバージョンではなくなってしまっているので復活させる。
      if(els.SEOJ.startsWith("0ef0") && "9f" in els.DETAILs)
      {
        EchoNetCommunicator.send(rinfo.address, [0x0e, 0xf0, 0x01], els.SEOJ, 0x62, "d6", [0x00] );
      }

      // 9fを受信したときに自動で取得するはずだが、echonet-lite.jsではd6が除外されてしまっている
      // (おそらく実装ミス。除外するならノードプロファイルのd6だけを除外しないといけない)
      // ノードプロファイル以外の場合で、9fにd6があるなら、GET要求する
      if(els.SEOJ.startsWith("0ef0") === false && "9f" in els.DETAILs)
      {
        const ip = rinfo.address;
        const eoj = els.SEOJ;

        const getPropertyCount = els.DETAILs["9f"].length/2-1;
        for(let i=0;i<getPropertyCount;i++)
        {
          const propertyCode = els.DETAILs["9f"].substring(i*2+2, i*2+2+2);
          if(propertyCode === "d6")
          {
            EchoNetCommunicator.send(rinfo.address, [0x0e, 0xf0, 0x01], els.SEOJ, 0x62, "d6", [0x00] );
          }
        }
      }

      // 9fを受信したら、それらのプロパティを受信するはず
      if("9f" in els.DETAILs)
      {
        let fiveSecondsLater = new Date();
        fiveSecondsLater.setSeconds(fiveSecondsLater.getSeconds() + 5);
        const expire = toUtcDateTimeText(fiveSecondsLater);

        const ip = rinfo.address;
        const eoj = els.SEOJ;

        const getPropertyCount = els.DETAILs["9f"].length/2-1;
        for(let i=0;i<getPropertyCount;i++)
        {
          const propertyCode = els.DETAILs["9f"].substring(i*2+2, i*2+2+2);
          if(propertyCode === "9f")
          {
            continue;
          }
          this.notGetProperties[`${ip}-${eoj}-${propertyCode}`] = {ip, eoj, propertyCode};
        }
      }
      
      // 受信したら、プロパティ待ちリストから除外する
      Object.keys(els.DETAILs).forEach(propertyCode =>{
        delete this.notGetProperties[`${rinfo.address}-${els.SEOJ}-${propertyCode}`];
      });
    }
  }
  static readonly mandatoryProperties:string[] = ["83", "8a", "9d", "9e", "9f"];

  private findDevice(echoNetRawStatus:EchoNetRawStatus):void
  {
    const echoNetRawData = EchoNetCommunicator.getRawDataSet();

    let detected:boolean = false;
    for(const ip of echoNetRawData.getIpList())
    {
      if((ip in echoNetRawStatus.nodes) === false)
      {
        echoNetRawStatus.nodes[ip] = {ip, state:"uncheck"};
      }

      for(const eoj of echoNetRawData.getEojList(ip))
      {
        const instanceId = `${ip}-${eoj}`;
        //const deviceRawData = echoNetRawData[ip][eoj];
        if((instanceId in echoNetRawStatus.devices) === false)
        {
          echoNetRawStatus.devices[instanceId] = {instanceId, state:"uncheck", deviceId:undefined};
        }
        if(echoNetRawStatus.devices[instanceId].deviceId !== undefined)
        {
          continue;
        }

        if(eoj === "0ef001")
        {
          if(echoNetRawStatus.nodes[ip].state !== "acquiredAllInstance")
          {
            continue;
          }
          const devices = Object.keys(echoNetRawStatus.devices)
            .filter(_=>_.startsWith(`${ip}-`))
            .filter(_=>_ !== instanceId)
            .map(_=>echoNetRawStatus.devices[_]);
          if(devices.filter(_=>_.deviceId === undefined).length !== 0)
          {
            continue;
          }

          const missingProperties = EchoNetLiteRawController.mandatoryProperties.filter(_=>echoNetRawData.existsData(ip, eoj, _)===false);
          if(missingProperties.length !== 0)
          {
            continue;
          }

          const deviceId = this.echoNetDeviceConverter.getDeviceIdForNodeProfile(echoNetRawData, ip);
          if(deviceId==="")
          {
            continue;
          }

          echoNetRawStatus.devices[instanceId] = {instanceId, state:echoNetRawStatus.devices[instanceId].state, deviceId:{eoj, ip, id:deviceId}};
          detected=true;
        }
        else
        {
          const missingProperties = EchoNetLiteRawController.mandatoryProperties.filter(_=>echoNetRawData.existsData(ip, eoj, _)===false);
          if(missingProperties.length === 0)
          {
            const deviceId = this.echoNetDeviceConverter.getDeviceId(ip, eoj, echoNetRawData);
            if(deviceId==="")
            {
              continue;
            }
            echoNetRawStatus.devices[instanceId] = {instanceId, state:echoNetRawStatus.devices[instanceId].state, deviceId:{eoj, ip, id:deviceId}};

            // 非対応デバイスはプロパティの再取得をしないように完了済みにしておく
            if(this.echoNetDeviceConverter.isSupportedDeviceType(eoj)===false)
            {
              echoNetRawStatus.devices[instanceId] = {instanceId, state:"acquiredAllProperty", deviceId:{eoj, ip, id:deviceId}};
            }
            detected=true;
          }
          else if(echoNetRawStatus.devices[instanceId].state === "acquiredMandatoryProperty" || 
            echoNetRawStatus.devices[instanceId].state === "requestedAllProperty" || 
            echoNetRawStatus.devices[instanceId].state === "acquiredAllProperty")
          {
            const deviceId = this.echoNetDeviceConverter.getDeviceId(ip, eoj, echoNetRawData);
            if(deviceId==="")
            {
              continue;
            }
            echoNetRawStatus.devices[instanceId] = {instanceId, state:echoNetRawStatus.devices[instanceId].state, deviceId:{eoj, ip, id:deviceId}};

            // 非対応デバイスはプロパティの再取得をしないように完了済みにしておく
            if(this.echoNetDeviceConverter.isSupportedDeviceType(eoj)===false)
            {
              echoNetRawStatus.devices[instanceId] = {instanceId, state:"acquiredAllProperty", deviceId:{eoj, ip, id:deviceId}};
            }
            detected=true;
          }
        }
      }
    
    }
    if(detected)
    {
      this.fireDeviceDetected();
    }
  }

  private deviceDetectedListeners:(()=>void)[] = [];
  public addDeviceDetectedEvent = (event:()=>void):void =>{
    this.deviceDetectedListeners.push(event);
  }
  private fireDeviceDetected = ():void=>{
    this.deviceDetectedListeners.forEach(_=>_());
  }

  public getAllDeviceIds():DeviceId[]
  {
    const results:DeviceId[] = [];

    Object.keys(this.echoNetRawStatus.devices).forEach((instanceId:string):void=>{
      const device = this.echoNetRawStatus.devices[instanceId];
      if(device.deviceId !== undefined)
      {
        results.push(device.deviceId);
      }
    });
    return results;
  }

  public retryGetDevice(echoNetRawStatus:EchoNetRawStatus):void
  {
    // 送信キューが空なら、未受信のプロパティを再取得する
    if(EchoNetCommunicator.getSendQueueLength() === 0)
    {
      Object.keys(this.notGetProperties).forEach(key=>{
        const propInfo = this.notGetProperties[key];
        console.log(`Not Received: ${propInfo.ip}\t${propInfo.eoj}\t${propInfo.propertyCode}`);
        EchoNetCommunicator.send(propInfo.ip, [0x0e, 0xf0, 0x01], propInfo.eoj, 0x62, propInfo.propertyCode, [0x00] );
        delete this.notGetProperties[key];
      })
    }

    const canRequest = EchoNetCommunicator.getSendQueueLength() <= 1

    let isRequested = false;
    const echoNetRawData = EchoNetCommunicator.getRawDataSet();
    // nodeProfileのインスタンスリストで取得していないデバイスを再取得する
    for(const ip of echoNetRawData.getIpList())
    {
      if((ip in echoNetRawStatus.nodes) === false)
      {
        continue;
      }
      if(echoNetRawStatus.nodes[ip].state === "acquiredAllInstance")
      {
        continue;
      }
      if(echoNetRawData.existsDevice(ip, "0ef001") === false)
      {
        // ここには来ないはず
        continue;
      }

      const selfNodeInstanceListSProperty = this.echoNetDeviceConverter.getProperty(ip, "0ef001", "selfNodeInstanceListS");
      if(selfNodeInstanceListSProperty === undefined)
      {
        continue;
      }
      const selfNodeInstanceListS = this.echoNetDeviceConverter.getPropertyValue(
        ip, "0ef001", 
        selfNodeInstanceListSProperty) as {numberOfInstances:number, instanceList:string[]};
      if(selfNodeInstanceListS === undefined)
      {
        continue;
      }

      const notGetDevices = selfNodeInstanceListS.instanceList.filter(_=>echoNetRawData.existsDevice(ip,_) === false);

      if(notGetDevices.length === 0)
      {
        // 状態:インスタンスの存在チェックPass
        echoNetRawStatus.nodes[ip] = {ip, state:"acquiredAllInstance"};
        continue;
      }

      if(canRequest)
      {
        if(ip in echoNetRawStatus.nodes && echoNetRawStatus.nodes[ip].state === "requestedInstance")
        {
          // すでにリクエスト済みならスキップする
          for(const notGetDeviceEoj of notGetDevices)
          {
            Logger.warn("[ECHONETLite][retry]", `failed to get instance ${ip} ${notGetDeviceEoj}`);
          }
          echoNetRawStatus.nodes[ip] = {ip, state:"acquiredAllInstance"};
          continue;
        }
        for(const notGetDeviceEoj of notGetDevices)
        {
          Logger.info("[ECHONETLite][retry]", `request instance ${ip} ${notGetDeviceEoj}`);
          isRequested = true;
          EchoNetCommunicator.getPropertyMaps(ip, notGetDeviceEoj);
        }

        // 状態:インスタンス取得要求済み
        echoNetRawStatus.nodes[ip] = {ip, state:"requestedInstance"};
      }
    }

    if(isRequested){return;}

    isRequested = false;
    // インスタンスごとに、Id、メーカーコード、INFマップ、SETマップ、GETマップが無ければ取得する
    for(const ip of echoNetRawData.getIpList())
    {
      for(const eoj of echoNetRawData.getEojList(ip))
      {
        const instanceId = `${ip}-${eoj}`;
        if((instanceId in echoNetRawStatus.devices) === false)
        {
          continue;
        }
        if(echoNetRawStatus.devices[instanceId].state === "acquiredMandatoryProperty" ||
          echoNetRawStatus.devices[instanceId].state === "requestedAllProperty" ||
          echoNetRawStatus.devices[instanceId].state === "acquiredAllProperty" )
        {
          // すでにチェック済みならスキップする
          continue;
        }


        const missingProperties = EchoNetLiteRawController.mandatoryProperties.filter(_=>echoNetRawData.existsData(ip, eoj, _)===false);
        if(missingProperties.length === 0)
        {
          // 状態: 必須プロパティ取得済み
          echoNetRawStatus.devices[instanceId] = {instanceId, state: "acquiredMandatoryProperty", deviceId:echoNetRawStatus.devices[instanceId].deviceId};
          continue;
        }
        if(canRequest)
        {
          if(echoNetRawStatus.devices[instanceId].state === "requestedMandatoryProperty")
          {
            // すでにリクエスト済みならスキップする
            for(const propertyNo of missingProperties)
            {
              Logger.warn("[ECHONETLite][retry]", `failed to get property ${ip} ${eoj} ${propertyNo}`);
            }
            echoNetRawStatus.devices[instanceId] = {instanceId, state: "acquiredMandatoryProperty", deviceId:echoNetRawStatus.devices[instanceId].deviceId};
            continue;
          }

          for(const propertyNo of missingProperties)
          {
            Logger.info("[ECHONETLite][retry]", `request property ${ip} ${eoj} ${propertyNo}`);
            EchoNetCommunicator.send(ip, [0x0e, 0xf0, 0x01], eoj, 0x62, propertyNo, [0x00] );
          }

          // 状態: 必須プロパティ取得要求済み
          isRequested = true;
          echoNetRawStatus.devices[instanceId] = {instanceId, state: "requestedMandatoryProperty", deviceId:echoNetRawStatus.devices[instanceId].deviceId};
        }
        else
        {
          continue;
        }
      }
    }

    if(isRequested){return;}

    // インスタンスごとに、Getプロパティが無ければ取得する
    isRequested = false;
    for(const ip of echoNetRawData.getIpList())
    {
      for(const eoj of echoNetRawData.getEojList(ip))
      {
        const instanceId = `${ip}-${eoj}`;

        if((instanceId in echoNetRawStatus.devices) === false)
        {
          continue;
        }
        if(echoNetRawStatus.devices[instanceId].state === "acquiredAllProperty")
        {
          // すでにチェック済みならスキップする
          continue;
        }
        if(echoNetRawStatus.devices[instanceId].state === "uncheck" || 
          echoNetRawStatus.devices[instanceId].state === "requestedMandatoryProperty")
        {
          // 必須プロパティの取得が終わっていないならスキップ
          continue;
        }
        const facilities = EchoNetCommunicator.getRawDataSet();
        const getPropNoList = this.echoNetDeviceConverter.convertGetPropertyNoList(ip, eoj, facilities);
        if(getPropNoList === undefined)
        {
          continue;
        }
        const notGetPropNoList = getPropNoList.filter(_=>echoNetRawData.existsData(ip, eoj, _)===false);
        if(notGetPropNoList.length === 0)
        {
          // 状態: 全GETプロパティ取得済み
          echoNetRawStatus.devices[instanceId] = {instanceId, state: "acquiredAllProperty", deviceId:echoNetRawStatus.devices[instanceId].deviceId};
          continue;
        }

        if(canRequest)
        {
          if(echoNetRawStatus.devices[instanceId].state === "requestedAllProperty")
          {
            // すでに要求済みなら、値を返さないGETプロパティと思われるので、完了とする
            for(const propertyNo of notGetPropNoList)
            {
              Logger.warn("[ECHONETLite][retry]", `failed to get property ${ip} ${eoj} ${propertyNo}`);
            }
            echoNetRawStatus.devices[instanceId] = {instanceId, state: "acquiredAllProperty", deviceId:echoNetRawStatus.devices[instanceId].deviceId};
            continue;
          }

          // 再取得を試みる
          for(const propertyNo of notGetPropNoList)
          {
            Logger.info("[ECHONETLite][retry]", `request property ${ip} ${eoj} ${propertyNo}`);
            EchoNetCommunicator.send(ip, [0x0e, 0xf0, 0x01], eoj, 0x62, propertyNo, [0x00] );
          }
          // 状態: 全GETプロパティ取得要求済み
          isRequested = true;
          echoNetRawStatus.devices[instanceId] = {instanceId, state: "requestedAllProperty", deviceId:echoNetRawStatus.devices[instanceId].deviceId};
        }
      }
    }

    if(isRequested){return;}

    if(canRequest)
    {
      if(Object.keys(echoNetRawStatus.nodes).length > 0 &&
        Object.keys(echoNetRawStatus.devices).filter(_=>echoNetRawStatus.devices[_].state !== "acquiredAllProperty").length === 0)
      {
        if(echoNetRawStatus.searchRetryCount === 0)
        {
          Logger.info("[ECHONETLite][retry]", `retry searching devices...`);
          EchoNetCommunicator.search();
          isRequested = true;
          echoNetRawStatus.searchRetryCount++;
        }
      }
    }
  }

  public getInternalStatus():EchoNetRawStatus
  {
    return this.echoNetRawStatus;
  }
}


export interface EchoNetRawStatus
{
  searchRetryCount:number;
	nodes:{[key:string]:EchoNetRawNodeStatus};
	devices:{[key:string]:EchoNetRawDeviceStatus};
}

export interface EchoNetRawNodeStatus
{
	ip:string;
	state: "uncheck"|"requestedInstance"|"acquiredAllInstance";
}

export interface EchoNetRawDeviceStatus
{
	instanceId: string;
	state: "uncheck"|"requestedMandatoryProperty"|"acquiredMandatoryProperty"|"requestedAllProperty"|"acquiredAllProperty"
  deviceId: DeviceId|undefined;
}

export interface EchoNetRawProperty
{
  ip:string;
  eoj:string;
  propertyCode:string;
}
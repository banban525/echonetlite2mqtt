import { eldata, rinfo } from "echonet-lite";
import { EchoNetCommunicator } from "./EchoNetCommunicator";
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

  public reveivePacketProc( rinfo:rinfo, els:eldata ):void
  {
    // no code
  }
  static readonly mandatoryProperties:string[] = ["83", "8a", "9d", "9e", "9f"];

  private findDevice(echoNetRawStatus:EchoNetRawStatus):void
  {
    const echoNetRawData = EchoNetCommunicator.getFacilities();

    let detected:boolean = false;
    for(const ip in echoNetRawData)
    {
      if((ip in echoNetRawStatus.nodes) === false)
      {
        echoNetRawStatus.nodes[ip] = {ip, state:"uncheck"};
      }

      for(const eoj in echoNetRawData[ip])
      {
        const instanceId = `${ip}-${eoj}`;
        const deviceRawData = echoNetRawData[ip][eoj];
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

          const missingProperties = EchoNetLiteRawController.mandatoryProperties.filter(_=>(_ in deviceRawData)===false);
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
          const missingProperties = EchoNetLiteRawController.mandatoryProperties.filter(_=>(_ in deviceRawData)===false);
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
    const canRequest = EchoNetCommunicator.getSendQueueLength() <= 1

    let isRequested = false;
    const echoNetRawData = EchoNetCommunicator.getFacilities();
    // nodeProfileのインスタンスリストで取得していないデバイスを再取得する
    for(const ip in echoNetRawData)
    {
      if((ip in echoNetRawStatus.nodes) === false)
      {
        continue;
      }
      if(echoNetRawStatus.nodes[ip].state === "acquiredAllInstance")
      {
        continue;
      }
      if(("0ef001" in echoNetRawData[ip]) === false)
      {
        // ここには来ないはず
        continue;
      }

      const selfNodeInstanceListSProperty = this.echoNetDeviceConverter.getProperty({eoj:"0ef001", ip, id:""}, "selfNodeInstanceListS");
      if(selfNodeInstanceListSProperty === undefined)
      {
        continue;
      }
      const selfNodeInstanceListS = this.echoNetDeviceConverter.getPropertyValue(
        {eoj:"0ef001", ip, id:""}, 
        selfNodeInstanceListSProperty) as {numberOfInstances:number, instanceList:string[]};
      if(selfNodeInstanceListS === undefined)
      {
        continue;
      }

      const notGetDevices = selfNodeInstanceListS.instanceList.filter(_=>(_ in echoNetRawData[ip]) === false);

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
    for(const ip in echoNetRawData)
    {
      for(const eoj in echoNetRawData[ip])
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

        const deviceRawData = echoNetRawData[ip][eoj];

        const missingProperties = EchoNetLiteRawController.mandatoryProperties.filter(_=>(_ in deviceRawData)===false);
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
    for(const ip in echoNetRawData)
    {
      for(const eoj in echoNetRawData[ip])
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
        const facilities = EchoNetCommunicator.getFacilities();
        const getPropNoList = this.echoNetDeviceConverter.convertGetPropertyNoList(ip, eoj, facilities);
        if(getPropNoList === undefined)
        {
          continue;
        }
        const notGetPropNoList = getPropNoList.filter(_=>(_ in facilities[ip][eoj])===false);
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
          echoNetRawStatus.searchRetryCount++;
          return;
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
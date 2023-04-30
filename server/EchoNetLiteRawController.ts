import { eldata, rinfo } from "echonet-lite";
import { EchoNetCommunicator } from "./EchoNetCommunicator";
import EchoNetDeviceConverter from "./EchoNetDeviceConverter";
import { DeviceId } from "./Property";


export class EchoNetLiteRawController
{
  readonly echoNetDeviceConverter:EchoNetDeviceConverter;
  private echoNetRawStatus:EchoNetRawStatus = {devices:{},nodes:{}};
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
      if(ip in echoNetRawStatus.nodes && echoNetRawStatus.nodes[ip].state === "acquiredAllInstance")
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
            console.log(`[ECHONETLite][retry] failed to get instance ${ip} ${notGetDeviceEoj}`);
          }
          echoNetRawStatus.nodes[ip] = {ip, state:"acquiredAllInstance"};
          continue;
        }
        for(const notGetDeviceEoj of notGetDevices)
        {
          console.log(`[ECHONETLite][retry] request instance ${ip} ${notGetDeviceEoj}`);
          isRequested = true;
          EchoNetCommunicator.getPropertyMaps(ip, notGetDeviceEoj);
        }

        // 状態:インスタンス取得要求済み
        echoNetRawStatus.nodes[ip] = {ip, state:"requestedInstance"};
      }
    }

    if(isRequested){return;}

    // インスタンスごとに、Id、メーカーコード、INFマップ、SETマップ、GETマップが無ければ取得する
    for(const ip in echoNetRawData)
    {
      for(const eoj in echoNetRawData[ip])
      {
        const instanceId = `${ip}-${eoj}`;
        if(instanceId in echoNetRawStatus.devices && (
          echoNetRawStatus.devices[instanceId].state === "acquiredMandatoryProperty" ||
          echoNetRawStatus.devices[instanceId].state === "requestedAllProperty" ||
          echoNetRawStatus.devices[instanceId].state === "acquiredAllProperty" ))
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

        if(instanceId in echoNetRawStatus.devices && echoNetRawStatus.devices[instanceId].state === "requestedMandatoryProperty")
        {
          // すでにリクエスト済みならスキップする
          for(const propertyNo of missingProperties)
          {
            console.log(`[ECHONETLite][retry] failed to get property ${ip} ${eoj} ${propertyNo}`);
          }
          echoNetRawStatus.devices[instanceId] = {instanceId, state: "acquiredMandatoryProperty", deviceId:echoNetRawStatus.devices[instanceId].deviceId};
          continue;
        }

        if(canRequest)
        {
          for(const propertyNo of missingProperties)
          {
            console.log(`[ECHONETLite][retry] request property ${ip} ${eoj} ${propertyNo}`);
            EchoNetCommunicator.send(ip, [0x0e, 0xf0, 0x01], eoj, 0x62, propertyNo, [0x00] );
          }

          // 状態: 必須プロパティ取得要求済み
          isRequested = true;
          echoNetRawStatus.devices[instanceId] = {instanceId, state: "requestedMandatoryProperty", deviceId:echoNetRawStatus.devices[instanceId].deviceId};
        }
      }
    }

    if(isRequested){return;}

    // インスタンスごとに、Getプロパティが無ければ取得する
    for(const ip in echoNetRawData)
    {
      for(const eoj in echoNetRawData[ip])
      {
        const instanceId = `${ip}-${eoj}`;
        if(instanceId in echoNetRawStatus.devices && echoNetRawStatus.devices[instanceId].state === "acquiredAllProperty")
        {
          // すでにチェック済みならスキップする
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

        if(instanceId in echoNetRawStatus.devices && echoNetRawStatus.devices[instanceId].state === "requestedAllProperty")
        {
          // すでに要求済みなら、値を返さないGETプロパティと思われるので、完了とする
          for(const propertyNo of notGetPropNoList)
          {
            console.log(`[ECHONETLite][retry] failed to get property ${ip} ${eoj} ${propertyNo}`);
          }
          echoNetRawStatus.devices[instanceId] = {instanceId, state: "acquiredAllProperty", deviceId:echoNetRawStatus.devices[instanceId].deviceId};
          continue;
        }

        if(canRequest)
        {
          // 再取得を試みる
          for(const propertyNo of notGetPropNoList)
          {
            console.log(`[ECHONETLite][retry] request property ${ip} ${eoj} ${propertyNo}`);
            EchoNetCommunicator.send(ip, [0x0e, 0xf0, 0x01], eoj, 0x62, propertyNo, [0x00] );
          }
          // 状態: 全GETプロパティ取得要求済み
          isRequested = true;
          echoNetRawStatus.devices[instanceId] = {instanceId, state: "requestedAllProperty", deviceId:echoNetRawStatus.devices[instanceId].deviceId};
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
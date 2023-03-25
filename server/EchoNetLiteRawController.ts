import EL, { eldata, rinfo } from "echonet-lite";
import EchoNetDeviceConverter from "./EchoNetDeviceConverter";


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
      // コマンドキューが空になった時にリトライする
      if(EL.autoGetWaitings === 0)
      {
        this.retryGetDevice(this.echoNetRawStatus);
      }
    }, 3000);
  }

  public reveivePacketProc( rinfo:rinfo, els:eldata ):void
  {
    // no code
  }

  public retryGetDevice(echoNetRawStatus:EchoNetRawStatus):void
  {
    const mandatoryProperties = ["83", "8a", "9d", "9e", "9f"];

    let isRequested = false;
    const echoNetRawData = EL.facilities;
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
        throw Error("unexpected error: not found 0ef001 instance");
      }

      const selfNodeInstanceListSProperty = this.echoNetDeviceConverter.getProperty({eoj:"0ef001", ip, id:""}, "selfNodeInstanceListS");
      if(selfNodeInstanceListSProperty === undefined)
      {
        throw Error("unexpected error: selfNodeInstanceListSProperty === undefined");
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
        EL.getPropertyMaps(ip, notGetDeviceEoj);
      }

      // 状態:インスタンス取得要求済み
      echoNetRawStatus.nodes[ip] = {ip, state:"requestedInstance"};
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

        const missingProperties = mandatoryProperties.filter(_=>(_ in deviceRawData)===false);
        if(missingProperties.length === 0)
        {
          // 状態: 必須プロパティ取得済み
          echoNetRawStatus.devices[instanceId] = {instanceId, state: "acquiredMandatoryProperty"};
          continue;
        }

        if(instanceId in echoNetRawStatus.devices && echoNetRawStatus.devices[instanceId].state === "requestedMandatoryProperty")
        {
          // すでにリクエスト済みならスキップする
          for(const propertyNo of missingProperties)
          {
            console.log(`[ECHONETLite][retry] failed to get property ${ip} ${eoj} ${propertyNo}`);
          }
          echoNetRawStatus.devices[instanceId] = {instanceId, state: "acquiredMandatoryProperty"};
          continue;
        }

        for(const propertyNo of missingProperties)
        {
          console.log(`[ECHONETLite][retry] request property ${ip} ${eoj} ${propertyNo}`);
          setTimeout(() => {
            EL.sendOPC1( ip, [0x0e, 0xf0, 0x01], eoj, 0x62, propertyNo, [0x00] );
            EL.decreaseWaitings();
          }, EL.autoGetDelay * (EL.autoGetWaitings+1));
          EL.increaseWaitings();
        }

        // 状態: 必須プロパティ取得要求済み
        isRequested = true;
        echoNetRawStatus.devices[instanceId] = {instanceId, state: "requestedMandatoryProperty"};
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

        const getPropNoList = this.echoNetDeviceConverter.convertGetPropertyNoList(ip, eoj, EL.facilities);
        if(getPropNoList === undefined)
        {
          throw new Error("unexpected error: getPropNoList is undefined");
        }
        const notGetPropNoList = getPropNoList.filter(_=>(_ in EL.facilities[ip][eoj])===false);
        if(notGetPropNoList.length === 0)
        {
          // 状態: 全GETプロパティ取得済み
          echoNetRawStatus.devices[instanceId] = {instanceId, state: "acquiredAllProperty"};
          continue;
        }

        if(instanceId in echoNetRawStatus.devices && echoNetRawStatus.devices[instanceId].state === "requestedAllProperty")
        {
          // すでに要求済みなら、値を返さないGETプロパティと思われるので、完了とする
          for(const propertyNo of notGetPropNoList)
          {
            console.log(`[ECHONETLite][retry] failed to get property ${ip} ${eoj} ${propertyNo}`);
          }
          echoNetRawStatus.devices[instanceId] = {instanceId, state: "acquiredAllProperty"};
          continue;
        }

        // 再取得を試みる
        for(const propertyNo of notGetPropNoList)
        {
          console.log(`[ECHONETLite][retry] request property ${ip} ${eoj} ${propertyNo}`);
          setTimeout(() => {
            EL.sendOPC1( ip, [0x0e, 0xf0, 0x01], eoj, 0x62, propertyNo, [0x00] );
            EL.decreaseWaitings();
          }, EL.autoGetDelay * (EL.autoGetWaitings+1));
          EL.increaseWaitings();
        }
        // 状態: 全GETプロパティ取得要求済み
        isRequested = true;
        echoNetRawStatus.devices[instanceId] = {instanceId, state: "requestedAllProperty"};

      }
    }
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
}
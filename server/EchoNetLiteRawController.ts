import { DeviceDetailsType, eldata,rinfo } from "echonet-lite";
import { Command, CommandResponse, Response, ELSV, EchoNetCommunicator, RawDataSet } from "./EchoNetCommunicator";
import { DeviceId } from "./Property";
import EchoNetDeviceConverter from "./EchoNetDeviceConverter";


export interface CommandWithCallback extends Command
{
  callback: ((res: CommandResponse) => void) | undefined;
}

export class EchoNetLiteRawController {
  private readonly nodes: RawNode[] = [];
  private readonly infQueue: Response[] = [];
  private readonly sendQueue: CommandWithCallback[] = [];
  private processing = false;

  constructor(echoNetDeviceConverter:EchoNetDeviceConverter) {
    
    EchoNetCommunicator.addReveivedHandler((rinfo, els) => {
      if (els.ESV === ELSV.INF) {
        this.infQueue.push({
          rinfo: rinfo,
          els: els
        });
        if ((this.infQueue.length + this.sendQueue.length) === 1) {
          // INFの処理
          this.processQueue();
        }
      }
    });

  }

  public getAllNodes = (): RawNode[] =>{
    return this.nodes;
  }

  public exec = (command:Command, callback:(res:CommandResponse)=>void):void =>
  {
    this.sendQueue.push({callback: callback, ...command});
    if ((this.infQueue.length + this.sendQueue.length) === 1) {
      this.processQueue();
    }
  }
  
  public execPromise = (command:Command):Promise<CommandResponse> =>
  {
    return new Promise<CommandResponse>((resolve, reject)=>{
      this.sendQueue.push({callback: (res)=>{
        resolve(res);
      }, ...command});
      if ((this.infQueue.length + this.sendQueue.length) === 1) {
        this.processQueue();
      }
    });
  }


  public enqueue = (command: Command): void  =>{
    this.sendQueue.push({callback: undefined, ...command});
    if ((this.infQueue.length + this.sendQueue.length) === 1) {
      this.processQueue();
    }
  }

  private static convertToInstanceList(data: string): string[] {
    const result: string[] = [];
    for (let i = 2; i < data.length; i += 6) {
      const eoj = data.substring(i, i + 6);
      result.push(eoj);
    }
    return result;
  }

  private findProperty = (ip: string, eoj: string, epc: string): RawDeviceProperty | undefined  =>{
    const node = this.nodes.find(_ => _.ip === ip);
    if (node === undefined) {
      return undefined;
    }
    const device = node.devices.find(_ => _.eoj === eoj);
    if (device === undefined) {
      return undefined;
    }
    const property = device.properties.find(_ => _.epc === epc);
    if (property === undefined) {
      return undefined;
    }
    return property;
  }

  private static getProperty = async (ip: string, eoj: string, epc: string): Promise<string | undefined> =>{
    let res: CommandResponse;
    try {
      res = await EchoNetCommunicator.execCommandPromise(ip, '0ef001', eoj, ELSV.GET, epc, "");
    }
    catch (e) {
      console.log(e);
      return undefined;
    }
    if (res.responses[0].els.ESV !== ELSV.GET_RES) {
      console.log(`error GET ${ip} ${eoj} ${epc}`);
      return undefined;
    }

    const data = res.responses[0].els.DETAILs;
    if ((epc in data) === false) {
      console.log(`error GET ${ip} ${eoj} ${epc}`);
      return undefined;
    }
    return data[epc];
  }

  private static async getNewNode(node: RawNode): Promise<RawNode> {
    const result: RawNode = {
      ip: node.ip,
      devices: node.devices.map(_ => ({
        ip: _.ip,
        eoj: _.eoj,
        properties: [],
        noExistsId: false
      }))
    };

    for (const device of result.devices) {
      let res: CommandResponse;
      try {
        res = await EchoNetCommunicator.getMultiPropertyPromise(result.ip, '0ef001', device.eoj, ELSV.GET, ["9d", "9e", "9f"]);
      }
      catch (e) {
        console.log(e);
        continue;
      }

      const edt = res.responses[0].els.DETAILs;
      if ("9f" in edt) {
        const data = edt["9f"];
        for (let i = 2; i < data.length; i += 2) {
          const epc = data.substring(i, i + 2);
          let matchProperty = device.properties.find(_ => _.epc === epc);
          if (matchProperty === undefined) {
            matchProperty = {
              ip: result.ip,
              eoj: device.eoj,
              epc: epc,
              value: "",
              operation: {
                get: false,
                set: false,
                inf: false
              }
            };
            device.properties.push(matchProperty);
          }
          matchProperty.operation.get = true;
        }
      }

      if ("9e" in edt) {
        const data = edt["9e"];
        for (let i = 2; i < data.length; i += 2) {
          const epc = data.substring(i, i + 2);
          let matchProperty = device.properties.find(_ => _.epc === epc);
          if (matchProperty === undefined) {
            matchProperty = {
              ip: result.ip,
              eoj: device.eoj,
              epc: epc,
              value: "",
              operation: {
                get: false,
                set: false,
                inf: false
              }
            };
            device.properties.push(matchProperty);
          }
          matchProperty.operation.set = true;
        }
      }

      if ("9d" in edt) {
        const data = edt["9d"];
        for (let i = 2; i < data.length; i += 2) {
          const epc = data.substring(i, i + 2);
          let matchProperty = device.properties.find(_ => _.epc === epc);
          if (matchProperty === undefined) {
            matchProperty = {
              ip: result.ip,
              eoj: device.eoj,
              epc: epc,
              value: "",
              operation: {
                get: false,
                set: false,
                inf: false
              }
            };
            device.properties.push(matchProperty);
          }
          matchProperty.operation.inf = true;
        }
      }

      for (const epc in edt) {
        const matchProperty = device.properties.find(_ => _.epc === epc);
        if (matchProperty !== undefined) {
          matchProperty.value = edt[epc];
        }
      }
    }

    // 取得していないgetプロパティを取得する
    for (const device of result.devices) {
      const epcList = device.properties.filter(_ => _.operation.get).filter(_ => _.value === "").map(_ => _.epc);
      for (const epc of epcList) {
        const value = await EchoNetLiteRawController.getProperty(result.ip, device.eoj, epc);
        if (value === undefined) {
          continue;
        }
        const matchProperty = device.properties.find(_ => _.epc === epc);
        if (matchProperty === undefined) {
          console.log(`error GET ${result.ip} ${device.eoj} ${epc}`);
          continue;
        }
        matchProperty.value = value;
      }
    }

    // 83 (識別番号)を取得していないのなら取得する
    // 本来、9f (getプロパティリスト)にないなら取得する必要はないのだが、過去バージョンでは9fに関わらずgetしていたので
    // 互換性のために取得する。
    // なお、9fに無くても、要求すると83を取得できるデバイスもある。
    for (const device of result.devices) {
      const idProperty = device.properties.find(_ => _.epc === "83");
      if (idProperty !== undefined) {
        continue;
      }
      let res: CommandResponse;
      try {
        res = await EchoNetCommunicator.execCommandPromise(device.ip, '0ef001', device.eoj, ELSV.GET, "83", "");
      }
      catch (e) {
        device.noExistsId = true;
        continue;
      }

      if (res.responses[0].els.ESV === ELSV.GET_RES) {
        const data = res.responses[0].els.DETAILs;
        let matchProperty = device.properties.find(_ => _.epc === "83");
        if (matchProperty === undefined) {
          matchProperty = {
            ip: result.ip,
            eoj: device.eoj,
            epc: "83",
            value: "",
            operation: {
              get: false,
              set: false,
              inf: false
            }
          };
          device.properties.push(matchProperty);
        }
        matchProperty.value = data["83"];
      }
      else if (res.responses[0].els.ESV === ELSV.GET_SNA) {
        device.noExistsId = true;
      }
    }


    return result;
  }




  private processQueue = async ():Promise<void> =>{
    if (this.processing) {
      return;
    }
    this.processing = true;
    try {
      // infから先に処理する
      while (this.infQueue.length > 0) {
        const inf = this.infQueue.shift();
        if (inf === undefined) {
          throw Error("ありえない");
        }

        const foundNode = this.nodes.find(_ => _.ip === inf.rinfo.address);
        if (foundNode === undefined) {
          // 新たなノードからの通知で、d5(自ノードインスタンスリスト通知)ならば、新しいノードを追加する
          if ("d5" in inf.els.DETAILs) {
            const nodeTemp: RawNode = {
              ip: inf.rinfo.address,
              devices: [{
                ip: inf.rinfo.address,
                eoj: "0ef001",
                properties: [],
                noExistsId: false
              }]
            };
            const eojList = EchoNetLiteRawController.convertToInstanceList(inf.els.DETAILs["d5"]);
            eojList.forEach(eoj => {
              nodeTemp.devices.push({
                ip: inf.rinfo.address,
                eoj: eoj,
                properties: [],
                noExistsId: false
              });
            });

            const newNode = await EchoNetLiteRawController.getNewNode(nodeTemp);
            this.nodes.push(newNode);
            this.fireDeviceDetected(newNode.devices.map(_=>({ip:_.ip, eoj:_.eoj})));
          }
          continue;
        }
        const foundDevice = foundNode.devices.find(_ => _.eoj === inf.els.SEOJ);
        if (foundDevice === undefined) {
          // 存在しないデバイスは無視する
          continue;
        }
        for (const epc in inf.els.DETAILs) {
          const foundProperty = foundDevice.properties.find(_ => _.epc === epc);
          if (foundProperty === undefined) {
            // 存在しないプロパティは無視する
            continue;
          }

          const oldValue = foundProperty.value;

          // 値を更新する
          foundProperty.value = inf.els.DETAILs[epc];

          // イベントを発火する
          this.firePropertyChanged(
            foundProperty.ip, 
            foundProperty.eoj, 
            foundProperty.epc, 
            oldValue, 
            foundProperty.value);
        }

        // 存在するノードからの d5 (自ノードインスタンスリスト通知)なら、
        if (inf.els.SEOJ === "0ef001" && "d5" in inf.els.DETAILs) {
          // 増えたインスタンスを追加する。削除は特に対処しない
          const eojList = EchoNetLiteRawController.convertToInstanceList(inf.els.DETAILs["d5"]);
          const currentEojList = foundNode.devices.map(_ => _.eoj);
          eojList.filter(_ => currentEojList.includes(_) == false).forEach(eoj => {
            foundNode.devices.push({
              ip: inf.rinfo.address,
              eoj: eoj,
              properties: [],
              noExistsId: false
            });
          });

          // 全プロパティを更新する
          for (const device of foundNode.devices) {
            for (const property of device.properties) {
              const newValue = await EchoNetLiteRawController.getProperty(property.ip, property.eoj, property.epc);
              if (newValue === undefined) {
                return;
              }
              const matchProperty = this.findProperty(property.ip, property.eoj, property.epc);
              if (matchProperty === undefined) {
                console.log(`error GET ${property.ip} ${property.eoj} ${property.epc}`);
                return;
              }

              const oldValue = matchProperty.value;
              matchProperty.value = newValue;

              // イベントを発火する
              this.firePropertyChanged(
                matchProperty.ip, 
                matchProperty.eoj, 
                matchProperty.epc, 
                oldValue, 
                matchProperty.value);
            }
          }
        }
      }


      while (this.sendQueue.length > 0) {
        const command = this.sendQueue.shift();
        if (command === undefined) {
          throw Error("ありえない");
        }
        const res = await EchoNetCommunicator.execCommandPromise(
          command.ip,
          command.seoj,
          command.deoj,
          command.esv,
          command.epc,
          command.edt);

        // GET_RESの場合は、値を更新する
        if(res.responses[0].els.ESV === ELSV.GET_RES)
        {
          const ip  = res.responses[0].rinfo.address;
          const eoj = res.responses[0].els.SEOJ;
          const els = res.responses[0].els;

          for(const epc in els.DETAILs)
          {
            const newValue = els.DETAILs[epc];

            const matchProperty = this.findProperty(ip, eoj, epc);
            if (matchProperty === undefined) {
              continue;
            }
  
            // const oldValue = matchProperty.value;
            matchProperty.value = newValue;
  
            // // イベントを発火する
            // this.firePropertyChanged(
            //   matchProperty.ip, 
            //   matchProperty.eoj, 
            //   matchProperty.epc, 
            //   oldValue, 
            //   matchProperty.value);
          }
        }

        if(command.callback !== undefined)
        {
          command.callback(res);
        }
      }
    }
    finally {
      this.processing = false;
    }

    if (this.infQueue.length > 0 || this.sendQueue.length > 0) {
      setTimeout(this.processQueue, 1);
    }
  }

  
  public initilize = async (objList:string[], echonetTargetNetwork:string, multiNicMode:boolean):Promise<void> =>
  {
    await EchoNetCommunicator.initialize(objList, 4, { v4: echonetTargetNetwork, autoGetProperties: false }, multiNicMode);
  }

  public start = async (): Promise<void> =>{

    // ネットワーク内のすべてのノードからd6(自ノードインスタンスリスト)を取得する
    const res = await EchoNetCommunicator.getForTimeoutPromise(
      '224.0.23.0',
      '0ef001',
      '0ef001',
      ELSV.GET,
      "d6",
      "",
      5000);

    // 取得結果から、ノードを作成する
    var nodesTemp = res.responses.map((response): RawNode => {
      const result: RawNode = {
        ip: response.rinfo.address,
        devices: [
          {
            ip: response.rinfo.address,
            eoj: "0ef001",
            properties: [],
            noExistsId: false
          }
        ]
      };

      if ("d6" in response.els.DETAILs) {
        EchoNetLiteRawController.convertToInstanceList(response.els.DETAILs["d6"]).forEach(eoj => {
          result.devices.push({
            ip: response.rinfo.address,
            eoj: eoj,
            properties: [],
            noExistsId: false
          });
        });
      }
      return result;
    });

    // ノードの詳細を取得する
    for (const node of nodesTemp) {
      const newNode = await EchoNetLiteRawController.getNewNode(node);
      this.nodes.push(newNode);
      this.fireDeviceDetected(newNode.devices.map(_=>({ip:_.ip, eoj:_.eoj})));
    }
  }

  private deviceDetectedListeners:((deviceKeys:{ip:string, eoj:string}[])=>void)[] = [];
  public addDeviceDetectedEvent = (event:(deviceKeys:{ip:string, eoj:string}[])=>void):void =>{
    this.deviceDetectedListeners.push(event);
  }
  private fireDeviceDetected = (deviceKeys:{ip:string, eoj:string}[]):void=>{
    this.deviceDetectedListeners.forEach(_=>_(deviceKeys));
  }

  readonly propertyChangedHandlers:((ip:string, eoj:string, epc:string, oldValue:string, newValue:string) => void)[] = [];
  public addPropertyChangedHandler = (event:(ip:string, eoj:string, epc:string, oldValue:string, newValue:string) => void):void =>
  {
    this.propertyChangedHandlers.push(event);
  }
  public firePropertyChanged = (ip:string, eoj:string, epc:string, oldValue:string, newValue:string):void =>
  {
    this.propertyChangedHandlers.forEach(_=>_(ip, eoj, epc, oldValue, newValue));
  }


  readonly reveivedHandlers:((rinfo: rinfo, els: eldata) => void)[] = [];
  public addReveivedHandler = (event:(rinfo: rinfo, els: eldata) => void):void =>
  {
    this.reveivedHandlers.push(event);
  }
  public fireReceived = (rinfo: rinfo, els: eldata):void =>
  {
    this.reveivedHandlers.forEach(_=>_(rinfo, els));
  }

  
  public getSendQueueLength = ():number=>
  {
    return EchoNetCommunicator.getSendQueueLength();
  }

  public replySetDetail = (rinfo: rinfo, els: eldata, dev_details:DeviceDetailsType):Promise<void> =>
  {
    return EchoNetCommunicator.replySetDetail(rinfo, els, dev_details);
  }
  public replyGetDetail = (rinfo: rinfo, els: eldata, dev_details:DeviceDetailsType):Promise<void> =>
  {
    return EchoNetCommunicator.replyGetDetail(rinfo, els, dev_details);
  }

  public updateidentifierFromMacAddress = (base:number[]):number[] =>
  {
    return EchoNetCommunicator.updateidentifierFromMacAddress(base);
  }

  public getInternalStatus = ():string =>
  {
    return JSON.stringify({
      elData:EchoNetCommunicator.getFacilities(),
      nodes:this.nodes
    });
  }

  public getRawDataSet = ():RawDataSet =>
  {
    return new RawDataSetforNodes(this.nodes);
  }
}

class RawDataSetforNodes implements RawDataSet
{
  private readonly nodes:RawNode[] = [];
  constructor(nodes:RawNode[])
  {
    this.nodes = nodes;
  }
  public existsDevice = (ip: string, eoj: string):boolean =>
  {
    const node = this.nodes.find(_=>_.ip === ip);
    if(node === undefined)
    {
      return false;
    }
    const device = node.devices.find(_=>_.eoj === eoj);
    if(device === undefined)
    {
      return false;
    }
    return true;
  }
  public existsData = (ip: string, eoj: string, epc: string):boolean =>
  {
    const node = this.nodes.find(_=>_.ip === ip);
    if(node === undefined)
    {
      return false;
    }
    const device = node.devices.find(_=>_.eoj === eoj);
    if(device === undefined)
    {
      return false;
    }
    const property = device.properties.find(_=>_.epc === epc);
    if(property === undefined)
    {
      return false;
    }
    return true;
  }
  public getIpList = ():string[] =>
  {
    return this.nodes.map(_=>_.ip);
  }

  public getEojList = (ip: string):string[] =>
  {
    const node = this.nodes.find(_=>_.ip === ip);
    if(node === undefined)
    {
      return [];
    }
    return node.devices.map(_=>_.eoj);
  }

  public getRawData = (ip: string, eoj: string, epc: string):string | undefined =>
  {
    const node = this.nodes.find(_=>_.ip === ip);
    if(node === undefined)
    {
      return undefined;
    }
    const device = node.devices.find(_=>_.eoj === eoj);
    if(device === undefined)
    {
      return undefined;
    }
    const property = device.properties.find(_=>_.epc === epc);
    if(property === undefined)
    {
      return undefined;
    }
    return property.value;
  }


}

export interface RawNode
{
  ip:string;
  devices:RawDevice[];
}
interface RawDevice
{
  ip:string;
  eoj:string;
  properties:RawDeviceProperty[];
  noExistsId:boolean;
}
export interface RawDeviceProperty
{
  ip:string;
  eoj:string;
  epc:string;
  value:string;
  operation:{
    get:boolean;
    set:boolean;
    inf:boolean;
  }
}
import { DeviceDetailsType, eldata,rinfo } from "echonet-lite";
import { Command, CommandResponse, Response, ELSV, EchoNetCommunicator, RawDataSet } from "./EchoNetCommunicator";
import { Logger } from "./Logger";


export interface CommandWithCallback extends Command
{
  callback: ((res: CommandResponse) => void) | undefined;
}

export class EchoNetLiteRawController {
  private readonly nodes: RawNode[] = [];
  private readonly infQueue: Response[] = [];
  private readonly sendQueue: CommandWithCallback[] = [];
  private processing = false;

  constructor() {
    
    EchoNetCommunicator.addReveivedHandler((rinfo, els) => {
      if (els.ESV === ELSV.INF) {
        this.infQueue.push({
          rinfo: rinfo,
          els: els
        });
        if (this.processing === false) {
          // INFの処理
          this.processQueue();
        }
      }
      this.fireReceived(rinfo, els);
    });

  }

  public getAllNodes = (): RawNode[] =>{
    return this.nodes;
  }

  public exec = (command:Command, callback:(res:CommandResponse)=>void):void =>
  {
    this.sendQueue.push({callback: callback, ...command});
    if (this.processing === false) {
      this.processQueue();
    }
  }
  
  public execPromise = (command:Command):Promise<CommandResponse> =>
  {
    return new Promise<CommandResponse>((resolve, reject)=>{
      this.sendQueue.push({callback: (res)=>{
        resolve(res);
      }, ...command});
      if (this.processing === false) {
        this.processQueue();
      }
    });
  }


  public enqueue = (command: Command): void  =>{
    this.sendQueue.push({callback: undefined, ...command});
    if (this.processing === false) {
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

  public static convertToPropertyList(rawData:string): string[] | undefined
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
      Logger.warn("[ECHONETLite][raw]", `error getProperty: timeout ${ip} ${eoj} ${epc}`, {exception:e});
      return undefined;
    }
    if (res.responses[0].els.ESV !== ELSV.GET_RES) {
      Logger.warn("[ECHONETLite][raw]", `error getProperty: returned ${res.responses[0].els.ESV} ${ip} ${eoj} ${epc}`);
      return undefined;
    }

    const data = res.responses[0].els.DETAILs;
    if ((epc in data) === false) {
      Logger.warn("[ECHONETLite][raw]", `error getProperty: data not found. ${ip} ${eoj} ${epc}`);
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

    // GET/SET/INFのプロパティマップを受信する
    for (const device of result.devices)
    {
      for(const epc of ["9f", "9e", "9d"])
      {
        let res: CommandResponse;
        try
        {
          res = await EchoNetCommunicator.execCommandPromise(result.ip, "0ef001", device.eoj, ELSV.GET, epc, "");
        }
        catch(e)
        {
          Logger.warn("[ECHONETLite][raw]", `error getNewNode: get ${epc}: exception ${result.ip} ${device.eoj}`, {exception:e});
          continue;
        }
        if(res.responses[0].els.ESV !== ELSV.GET_RES)
        {
          Logger.warn("[ECHONETLite][raw]", `error getNewNode: get ${epc}: returned not GET_RES ${result.ip} ${device.eoj}`);
          continue;
        }
        const edt = res.responses[0].els.DETAILs;
        if ((epc in edt) === false)
        {
          Logger.warn("[ECHONETLite][raw]", `error getNewNode: get ${epc}: invalid reveive data ${result.ip} ${device.eoj} ${JSON.stringify(edt)}`);
          continue;
        }
        const data = edt[epc];
        const propertyList = EchoNetLiteRawController.convertToPropertyList(data);
        if(propertyList === undefined)
        {
          Logger.warn("[ECHONETLite][raw]", `error getNewNode: get ${epc}: invalid reveive data 2 ${result.ip} ${device.eoj} ${JSON.stringify(edt)}`);
          continue;
        }
        for(const propertyMapEpc of propertyList)
        {
          let matchProperty = device.properties.find(_ => _.epc === propertyMapEpc);
          if (matchProperty === undefined) {
            matchProperty = {
              ip: result.ip,
              eoj: device.eoj,
              epc: propertyMapEpc,
              value: "",
              operation: {
                get: false,
                set: false,
                inf: false
              }
            };
            device.properties.push(matchProperty);
          }
          if(epc === "9f"){
            matchProperty.operation.get = true;
          }
          if(epc === "9e"){
            matchProperty.operation.set = true;
          }
          if(epc === "9d"){
            matchProperty.operation.inf = true;
          }
        }
        
        // 受信したデータをプロパティとして格納する
        for (const epc in edt) {
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
          throw Error("ありえない");
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
            const currentIndex = this.nodes.findIndex(_=>_.ip === newNode.ip);
            if(currentIndex===-1)
            {
              this.nodes.push(newNode);
            }
            else
            {
              this.nodes[currentIndex] = newNode;
            }
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
            for (const property of device.properties.filter(_=>_.operation.get)) {
              const newValue = await EchoNetLiteRawController.getProperty(property.ip, property.eoj, property.epc);
              if (newValue === undefined) {
                continue;
              }
              const matchProperty = this.findProperty(property.ip, property.eoj, property.epc);
              if (matchProperty === undefined) {
                throw Error("ありえない");
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
        let res: CommandResponse;
        try
        {
          res = await EchoNetCommunicator.execCommandPromise(
            command.ip,
            command.seoj,
            command.deoj,
            command.esv,
            command.epc,
            command.edt);
        }
        catch(e)
        {
          Logger.warn("[ECHONETLite][raw]", `error send command: timeout ${command.ip} ${command.seoj} ${command.deoj} ${command.esv} ${command.epc} ${command.edt}`, {exception:e});
          continue;
        }

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

  
  public initilize = async (objList:string[], echonetTargetNetwork:string, legacyMultiNicMode:boolean):Promise<void> =>
  {
    await EchoNetCommunicator.initialize(objList, 4, { v4: echonetTargetNetwork, autoGetProperties: false }, 
      legacyMultiNicMode===false);
  }

  public searchDeviceFromIp = async (ip:string):Promise<void> =>
  {
    let res: CommandResponse;
    try {
      res = await EchoNetCommunicator.execCommandPromise(ip, '0ef001', '0ef001', ELSV.GET, "d6", "");
    }
    catch (e) {
      Logger.warn("[ECHONETLite][raw]", `error searchDeviceFromIp: timeout ${ip} 0ef001 d6`, {exception:e});
      return undefined;
    }
    if(res.responses.length === 0)
    {
      Logger.warn("[ECHONETLite][raw]", `error searchDeviceFromIp: timeout ${ip}`);
      return;
    }
    const response = res.responses[0];
    if(response.els.ESV !== ELSV.GET_RES)
    {
      Logger.warn("[ECHONETLite][raw]", `error searchDeviceFromIp: returned ${response.els.ESV} ${ip}`)
      return;
    }
    const data = response.els.DETAILs;
    if (("d6" in data) === false) {
      Logger.warn("[ECHONETLite][raw]", `error searchDeviceFromIp: data not found. ${ip}`);
      return;
    }
    const node: RawNode = {
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
    EchoNetLiteRawController.convertToInstanceList(response.els.DETAILs["d6"]).forEach(eoj => {
      node.devices.push({
        ip: response.rinfo.address,
        eoj: eoj,
        properties: [],
        noExistsId: false
      });
    });

    // ノードの詳細を取得する
    const newNode = await EchoNetLiteRawController.getNewNode(node);

    const currentIndex = this.nodes.findIndex(_=>_.ip === newNode.ip);
    if(currentIndex===-1)
    {
      this.nodes.push(newNode);
    }
    else
    {
      this.nodes[currentIndex] = newNode;
    }

    this.fireDeviceDetected(newNode.devices.map(_=>({ip:_.ip, eoj:_.eoj})));
  }

  public searchDevicesInNetwork = async (): Promise<void> =>{

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
      const currentIndex = this.nodes.findIndex(_=>_.ip === newNode.ip);
      if(currentIndex===-1)
      {
        this.nodes.push(newNode);
      }
      else
      {
        this.nodes[currentIndex] = newNode;
      }
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
    }, null, 2);
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
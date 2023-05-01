import EL, { facilitiesType,eldata,rinfo, DeviceDetailsType } from "echonet-lite";


export class EchoNetCommunicator
{
  public static initialize = async (
    objList: string[],
    ipVer?: number,
    Options?: {
      v4?: string;
      v6?: string;
      ignoreMe?: boolean;
      autoGetProperties?: boolean;
      autoGetDelay?: number;
      debugMode?: boolean;
    }
  ): Promise<{ sock4: any; sock6: any } | any> =>
  {
    // maker code
    EL.Node_details["8a"][0]=0xff;
    EL.Node_details["8a"][1]=0xff;
    EL.Node_details["8a"][2]=0xfe;

    return EL.initialize(objList, this.echonetUserFunc, ipVer, Options)
      .then(()=>{
        EL.Node_details["83"][1]=0xff;
        EL.Node_details["83"][2]=0xff;
        EL.Node_details["83"][3]=0xfe;
      });
  }

  public static updateidentifierFromMacAddress = (base:number[]):number[] =>
  {
    const result = JSON.parse(JSON.stringify(base));
    result[7]  = EL.Node_details["83"][7];
    result[8]  = EL.Node_details["83"][8];
    result[9]  = EL.Node_details["83"][9];
    result[10] = EL.Node_details["83"][10];
    result[11] = EL.Node_details["83"][11];
    result[12] = EL.Node_details["83"][12];

    return result;
  }

  static echonetUserFunc = (rinfo: rinfo, els: eldata):void =>
  {
    if(els.ESV === ELSV.SET_RES)
    {
      this.setResponseHandlers.forEach(_=>_(rinfo,els));
    }
    if(els.ESV === ELSV.GET_RES)
    {
      this.getResponseHandlers.forEach(_=>_(rinfo,els));
    }
    if(els.ESV === ELSV.INF)
    {
      this.infoHandlers.forEach(_=>_(rinfo,els));
    }
    if(els.ESV === ELSV.SETC || els.ESV === ELSV.SETI)
    {
      this.setHandlers.forEach(_=>_(rinfo,els));
    }
    if(els.ESV === ELSV.GET)
    {
      this.getHandlers.forEach(_=>_(rinfo,els));
    }
    this.reveivedHandlers.forEach(_=>_(rinfo,els));
  }

  static readonly getResponseHandlers:((rinfo: rinfo, els: eldata) => void)[] = [];
  public static addGetResponseHandler = (event:(rinfo: rinfo, els: eldata) => void):void =>
  {
    this.getResponseHandlers.push(event);
  }
  static readonly setResponseHandlers:((rinfo: rinfo, els: eldata) => void)[] = [];
  public static addSetResponseHandler = (event:(rinfo: rinfo, els: eldata) => void):void =>
  {
    this.setResponseHandlers.push(event);
  }

  static readonly infoHandlers:((rinfo: rinfo, els: eldata) => void)[] = [];
  public static addInfoHandler = (event:(rinfo: rinfo, els: eldata) => void):void =>
  {
    this.infoHandlers.push(event);
  }
  static readonly getHandlers:((rinfo: rinfo, els: eldata) => void)[] = [];
  public static addGetHandler = (event:(rinfo: rinfo, els: eldata) => void):void =>
  {
    this.getHandlers.push(event);
  }
  static readonly setHandlers:((rinfo: rinfo, els: eldata) => void)[] = [];
  public static addSetHandler = (event:(rinfo: rinfo, els: eldata) => void):void =>
  {
    this.setHandlers.push(event);
  }

  static readonly reveivedHandlers:((rinfo: rinfo, els: eldata) => void)[] = [];
  public static addReveivedHandler = (event:(rinfo: rinfo, els: eldata) => void):void =>
  {
    this.reveivedHandlers.push(event);
  }

  public static getFacilities = (): facilitiesType=>
  {
    return EL.facilities;
  }
  public static send = (
    ip: string,
    seoj: string | number[],
    deoj: string | number[],
    esv: string | number,
    epc: string | number,
    edt: string | number | number[]
  ): void =>
  {
    setTimeout(() => {
      EL.sendOPC1(ip, seoj, deoj, esv, epc, edt);
      EL.decreaseWaitings();
    }, EL.autoGetDelay * (EL.autoGetWaitings+1));
    EL.increaseWaitings();
  }
  public static sendNow = (
    ip: string,
    seoj: string | number[],
    deoj: string | number[],
    esv: string | number,
    epc: string | number,
    edt: string | number | number[]
  ): void =>
  {
    EL.sendOPC1(ip, seoj, deoj, esv, epc, edt);
  }

  public static setObserveFacilities = (interval: number, onChanged: () => void): void =>
  {
    EL.setObserveFacilities(interval, onChanged);
  }
  public static search = (): void =>
  {
    EL.search();
  }
  public static getPropertyMaps = (ip: string, eoj: string | number[]): void =>
  {
    EL.getPropertyMaps(ip, eoj);
  }
  public static getSendQueueLength = ():number => 
  {
    return EL.autoGetWaitings;
  }
  public static replySetDetail = async (rinfo: rinfo, els: eldata, dev_details:DeviceDetailsType):Promise<void> =>
  {
    return EL.replySetDetail(rinfo, els, dev_details);
  }
  public static replyGetDetail = async (rinfo: rinfo, els: eldata, dev_details:DeviceDetailsType):Promise<void> =>
  {
    return EL.replyGetDetail(rinfo, els, dev_details);
  }

}

export class ELSV
{
  public static readonly GET="62";
  public static readonly GET_RES="72";
  public static readonly INF="73";
  public static readonly SETC="61";
  public static readonly SETI="60";
  public static readonly SET_RES="71";
}
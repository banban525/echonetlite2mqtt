import EL, { facilitiesType,eldata,rinfo } from "echonet-lite";


export class EchoNetCommunicator
{
  public static initialize = (
    objList: string[],
    userfunc: (rinfo: rinfo, els: eldata) => void,
    ipVer?: number,
    Options?: {
      v4?: string;
      v6?: string;
      ignoreMe?: boolean;
      autoGetProperties?: boolean;
      autoGetDelay?: number;
      debugMode?: boolean;
    }
  ): { sock4: any; sock6: any } | any =>
  {
    return EL.initialize(objList, userfunc, ipVer, Options);
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
}

export class ELSV
{
  public static readonly GET="62";
  public static readonly GET_RES="72";
  public static readonly INF="73";
  public static readonly SETC="61";
  public static readonly SET_RES="71";
}
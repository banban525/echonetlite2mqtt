import { ElPropertyDescription } from "./MraTypes";



export interface ServerStatus {
  mqttState: "Connected" | "Disconnected" | "NotConfigure";
  systemVersion: string,
  devices: ApiDeviceSummary[];
}

export class ServerStatus{
  static empty:ServerStatus = {
    mqttState: "Disconnected",
    systemVersion: "0.0.0",
    devices:[]
  }
}

export interface ApiVersion{
  id:string;
  status:"CURRENT"|"SUPPORTED"|"DEPRECATED"|"EXPERIMENTAL",
  updated:string;
}
  
export  interface ApiService
{
  name: string;
  descriptions: {
    ja:string;
    en:string;
  };
  total:number;
}

// /elapi/v1/devices → ApiDeviceSummary[]
export interface ApiDeviceSummary
{
  id:string;
  name:string;
  deviceType:string;
  eoj:string;
  ip:string;
  mqttTopics:string;
  protocol:{
    type:string;
    version:string;
  };
  manufacturer:{
    code:string;
    descriptions:{
      ja:string;
      en:string;
    }
  }
}
  
// /elapi/v1/devices/<device id> → ApiDevice
export interface ApiDevice{
  id:string;
  name:string;
  deviceType:string;
  eoj:string;
  ip:string;
  mqttTopics:string;
  descriptions:{
    ja:string;
    en:string;
  };
  properties:ApiDeviceProperty[];
  actions:ApiDeviceAction[];
  events:object[];
  propertyValues: any;
  values: {[key:string]:ApiDevicePropertyValue}
}

export interface ApiDevicePropertyValue
{
  name:string;
  value:any;
  updated:string;  // YYYY-MM-DD HH:mm:ss
}

export   interface ApiDeviceProperty{
  name:string;
  mqttTopics:string;
  epc:string;
  epcAtomic:string;
  descriptions:{
    ja:string;
    en:string;
  };
  writable:boolean;
  observable:boolean;
  urlParameters:string[];
  schema:ElPropertyDescription;
  note:{
    ja:string;
    en:string;
  }
}


export  interface ApiDeviceAction{
  epc:string;
  descriptions:{
    ja:string;
    en:string;
  };
  input:{
    type: "object",
    properties: {[key:string]:string;};
    required: string[];
  };
  schema:object;
  note:{
    ja:string;
    en:string;
  }
}

export class SystemStatusRepositry{
  public SystemStatus:ServerStatus = ServerStatus.empty;
}
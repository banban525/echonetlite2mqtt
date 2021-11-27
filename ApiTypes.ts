import { DevicePropertySchema } from "*/device_descriptions_v1.3.0/all_device_descriptions_v1.3.0.json";



export interface ServerStatus {
  mqttState: "Connected" | "Disconnected";
  devices: ApiDeviceSummary[];
}

export class ServerStatus{
  static empty:ServerStatus = {
    mqttState: "Disconnected",
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
  schema:DevicePropertySchema;
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
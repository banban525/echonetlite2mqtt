import { DeviceProperty } from "./AllDeviceDescriptions";

export interface Manufacturer{
  code: string;
  descriptions:{
    ja:string;
    en:string;
  }
}

export interface device{
  id:string;
  ip:string;
  deviceType:string;
  eoj:string;
  descriptions:{
    ja:string;
    en:string;
  };
  properties:Property[];
  protocol: {
    type:string;
    version:string;
  };
  manufacturer:Manufacturer;
  propertiesValue: {[key:string]:any};
}

export interface Property extends DeviceProperty{
  name:string;
}

export interface DeviceId {
  id:string;
  ip:string;
  eoj:string;
}
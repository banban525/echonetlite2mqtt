import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { AppApi, AppStore, Log, ServerStatus } from "./AppStore";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "mobx-react";
import { BrowserRouter, Route } from "react-router-dom";
import Device from "./Device";
import {
  DeviceInfo,
  DeviceApi,
  DeviceStore,
  DevicePropertySchema,
} from "./DeviceStore";

class WebApi implements AppApi, DeviceApi {
  constructor() {
    this.eventReceiver();
  }

  lastEventId = "";
  private eventReceiver = async (): Promise<void> => {
    let events: { id: string; events: string[] } = { id: "", events: [] };
    try {
      const res = await fetch(`/events?lastEvent=${this.lastEventId}`);
      events = await res.json();
    } catch (err) {
      console.log(err);
      setTimeout(this.eventReceiver, 1000);
      return;
    }
    this.lastEventId = events.id;
    for (const event of events.events) {
      console.log(event);
      if (event === "SYSTEM") {
        this.serverStatusUpdatedListener.forEach((_) => _());
      } else if (event === "LOG") {
        this.logRegisteredListener.forEach((_) => _());
      } else {
        this.deviceUpdatedListener.forEach((_) => _(event));
      }
    }
    setTimeout(this.eventReceiver, 100);
  };

  public getDevice = async (id: string): Promise<DeviceInfo> => {
    const res = await fetch(`/elapi/v1/devices/${id}`);
    const json = await res.json();
    return json as DeviceInfo;
  };
  lastStatus: ServerStatus = ServerStatus.Empty;
  public getServerStatus = async (): Promise<ServerStatus> => {
    const res = await fetch("/status");
    const json = await res.json();
    this.lastStatus = json as ServerStatus;
    //console.log(this.lastStatus);
    return this.lastStatus;
  };

  deviceUpdatedListener: ((deviceId: string) => void)[] = [];
  public onDeviceUpdated = (ev: (deviceId: string) => void): void => {
    this.deviceUpdatedListener.push(ev);
  };

  serverStatusUpdatedListener: (() => void)[] = [];
  public onServerStatusUpdated = (ev: () => void): void => {
    this.serverStatusUpdatedListener.push(ev);
  };
  setDeviceProperty = async (
    deviceId: string,
    propertyName: string,
    schema: DevicePropertySchema,
    newValue: unknown
  ): Promise<void> => {
    const body: { [key: string]: unknown } = {};
    body[propertyName] = newValue;
    const bodyJson = JSON.stringify(body);
    await fetch(`/elapi/v1/devices/${deviceId}/properties/${propertyName}`, {
      method: "put",
      body: bodyJson,
      headers: { "Content-Type": "application/json" },
    });
  };
  logRegisteredListener: (() => void)[] = [];
  onLogRegistered = (ev: () => void): void => {
    this.logRegisteredListener.push(ev);
  };
  getLogs = async (): Promise<Log[]> => {
    const res = await fetch("/logs");
    const logs = (await res.json()) as Log[];
    return logs;
  };
}

// class LocalApi implements AppApi, DeviceApi {
//   constructor() {
//     (async (): Promise<void> => {
//       const res = await fetch("/sample-homeAirConditioner.json");
//       const json = (await res.json()) as DeviceInfo;
//       this.devices.push(json);

//       this.fireDeviceUpdated(json.id);
//       this.fireServerStatusUpdated();
//     })();
//   }
//   status: ServerStatus = {
//     mqttState: "Disconnected",
//     devices: [],
//   };
//   devices: DeviceInfo[] = [
//     {
//       id: "fe00000601052c9ffbfffeb18384013009",
//       ip: "192.168.0.100",
//       eoj: "103001",
//       mqttTopics: "devices/fe00000601052c9ffbfffeb18384013009",
//       deviceType: "homeAirConditioner",
//       actions: [],
//       properties: [
//         {
//           name: "operationStatus",
//           epc: "0x80",
//           descriptions: {
//             ja: "動作状態",
//             en: "Operation status",
//           },
//           writable: true,
//           observable: true,
//           schema: {
//             type: "boolean",
//             values: [
//               {
//                 value: true,
//                 descriptions: {
//                   ja: "ON",
//                   en: "ON",
//                 },
//                 edt: "0x30",
//               },
//               {
//                 value: false,
//                 descriptions: {
//                   ja: "OFF",
//                   en: "OFF",
//                 },
//                 edt: "0x31",
//               },
//             ],
//           },
//           epcAtomic: "0x80",
//           mqttTopics:
//             "devices/fe00000601052c9ffbfffeb18384013001/properties/operationStatus",
//           note: {
//             en: "",
//             ja: "",
//           },
//           urlParameters: [],
//         },
//         {
//           name: "installationLocation",
//           epc: "0x81",
//           descriptions: {
//             ja: "設置場所",
//             en: "Installation location",
//           },
//           writable: false,
//           observable: false,
//           schema: {
//             type: "string",
//           },
//           epcAtomic: "0x81",
//           mqttTopics:
//             "devices/fe00000601052c9ffbfffeb18384013001/properties/installationLocation",
//           note: {
//             en: "",
//             ja: "",
//           },
//           urlParameters: [],
//         },
//       ],
//       propertyValues: {
//         operationStatus: "false",
//         installationLocation: "NotSet",
//         protocol: { type: "ECHONET_Lite v1.13", version: "Rel.K" },
//         id: "fe00000601052c9ffbfffeb18384013001",
//         cumulativeElectricEnergy: "1581.1000000000001",
//         manufacturerFaultCode: "06000006000000028000",
//         faultStatus: "false",
//         faultDescription: "0000",
//         manufacturer: { code: "000006", descriptions: [Object] },
//         businessFacilityCode: "000029",
//         powerSaving: "false",
//         hourMeter: 6979.366666666667,
//         airFlowLevel: "auto",
//         automaticControlAirFlowDirection: "auto",
//         automaticSwingAirFlow: "off",
//         airFlowDirectionVertical: "uppermost",
//         airFlowDirectionHorizontal: "c",
//         operationMode: "cooling",
//         targetTemperature: "26",
//         roomTemperature: "28",
//         outdoorTemperature: "unmeasurable",
//       },
//     },
//     {
//       id: "123456789012345678901234567890",
//       ip: "192.168.0.101",
//       eoj: "103001",
//       mqttTopics: "devices/123456789012345678901234567890",
//       deviceType: "homeAirConditioner",
//       actions: [],
//       properties: [],
//       propertyValues: {},
//     },
//   ];
//   getServerStatus = async (): Promise<ServerStatus> => {
//     const result = JSON.parse(JSON.stringify(this.status)) as ServerStatus;
//     result.devices = this.devices;
//     return result;
//   };
//   getDevice = async (id: string): Promise<DeviceInfo> => {
//     const match = this.devices.find((_): boolean => _.id === id);
//     if (match === undefined) {
//       return DeviceInfo.Empty;
//     }
//     return match;
//   };

//   deviceUpdatedListener: ((deviceId: string) => void)[] = [];
//   onDeviceUpdated = (ev: (deviceId: string) => void): void => {
//     this.deviceUpdatedListener.push(ev);
//   };
//   serverStatusUpdatedListener: (() => void)[] = [];
//   public onServerStatusUpdated = (ev: () => void): void => {
//     this.serverStatusUpdatedListener.push(ev);
//   };

//   fireDeviceUpdated = (deviceId: string): void => {
//     this.deviceUpdatedListener.forEach((_) => {
//       _(deviceId);
//     });
//   };
//   fireServerStatusUpdated = (): void => {
//     this.serverStatusUpdatedListener.forEach((_) => {
//       _();
//     });
//   };

//   setDeviceProperty = async (
//     deviceId: string,
//     propertyName: string,
//     schema: DevicePropertySchema,
//     newValue: unknown
//   ): Promise<void> => {
//     const device = this.devices.find((_) => _.id === deviceId);
//     if (device === undefined) {
//       return;
//     }
//     if (propertyName in device.propertyValues === false) {
//       return;
//     }
//     device.propertyValues[propertyName] = newValue;
//     this.fireDeviceUpdated(deviceId);
//   };
//   onLogRegistered = (ev: () => void): void => {
//     //
//   };
//   getLogs = async (): Promise<Log[]> => {
//     return [];
//   };
// }

const api = new WebApi();

const stores = {
  app: new AppStore(api),
  device: new DeviceStore(api),
};

ReactDOM.render(
  <React.StrictMode>
    <Provider {...stores}>
      <BrowserRouter basename={"/"}>
        <Route exact path="/" component={App} />
        <Route exact path="/devices/:id" component={Device} />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

import { makeAutoObservable, observable } from "mobx";

export interface ServerStatus {
  mqttState: string;
  systemVersion: string;
  devices: DeviceSummary[];
}

export class ServerStatus {
  static Empty: Readonly<ServerStatus> = {
    devices: [],
    mqttState: "Unknown",
    systemVersion: "0.0.0",
  };
}

export interface DeviceSummary {
  id: string;
  deviceType: string;
  mqttTopics: string;
  ip: string;
  eoj: string;
}

export interface Log {
  id: string;
  datetime: string;
  message: string;
}

export interface AppApi {
  getServerStatus(): Promise<ServerStatus>;
  onServerStatusUpdated(ev: () => void): void;
  onLogRegistered(ev: () => void): void;
  getLogs(): Promise<Log[]>;
}

export class AppStore {
  api: AppApi;
  constructor(api: AppApi) {
    this.api = api;
    this.api.onServerStatusUpdated(() => {
      (async (): Promise<void> => {
        this.updating = true;
        this.status = await this.api.getServerStatus();
        this.updating = false;
      })();
    });
    this.api.onLogRegistered(() => {
      (async (): Promise<void> => {
        this.updating = true;
        const logs = await this.api.getLogs();
        this.logs = logs.reverse();
        this.updating = false;
      })();
    });
    makeAutoObservable(this);
  }
  @observable
  status: Readonly<ServerStatus> = ServerStatus.Empty;
  @observable
  updating = false;
  @observable
  logs: Log[] = [];

  public initialize = async (): Promise<void> => {
    if (this.updating) {
      return;
    }
    this.updating = true;
    this.status = await this.api.getServerStatus();
    const logs = await this.api.getLogs();
    this.logs = logs.reverse();
    this.updating = false;
  };

  public terminate = async (): Promise<void> => {
    //
  };
}

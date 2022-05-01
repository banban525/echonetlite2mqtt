import { makeAutoObservable, observable } from "mobx";
import { DeviceSummary } from "./AppStore";

export interface DeviceInfo extends DeviceSummary {
  properties: DeviceProperty[];
  actions: DeviceAction[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  propertyValues: any;
}

export class DeviceInfo {
  static Empty: Readonly<DeviceInfo> = {
    id: "",
    eoj: "",
    ip: "",
    mqttTopics: "",
    propertyValues: {},
    deviceType: "",
    actions: [],
    properties: [],
  };
}
export interface BooleanPropertySchema {
  type: "boolean";
  values: {
    value: boolean;
    descriptions: {
      ja: string;
      en: string;
    };
    edt?: string;
  }[];
}

export interface StringPropertySchema {
  type: "string";
  format?: "date-time" | "date" | "time";
  enum?: string[];
  values?: {
    value: string;
    descriptions: {
      ja: string;
      en: string;
    };
    edt?: string;
  }[];
}
export interface NumberPropertySchema {
  type: "number";
  unit?: string;
  minimum?: number;
  maximum?: number;
  multipleOf?: number;
}
export interface NullPropertySchema {
  type: "null";
  edt?: string;
}
export interface ArrayPropertySchema {
  type: "array";
  minItems?: number;
  maxItems?: number;
  items: DevicePropertySchema;
}
export interface ObjectPropertySchema {
  type: "object";
  properties: { [key: string]: DevicePropertySchema };
}
export interface MixedTypePropertySchema {
  oneOf: DevicePropertySchema[];
}
export type DevicePropertySchema =
  | BooleanPropertySchema
  | StringPropertySchema
  | NumberPropertySchema
  | NullPropertySchema
  | ArrayPropertySchema
  | ObjectPropertySchema
  | MixedTypePropertySchema;

export interface DeviceProperty {
  name: string;
  mqttTopics: string;
  epc: string;
  epcAtomic: string;
  descriptions: {
    ja: string;
    en: string;
  };
  writable: boolean;
  observable: boolean;
  urlParameters: string[];
  schema: DevicePropertySchema;
  note: {
    ja: string;
    en: string;
  };
}
export interface DeviceAction {
  name: string;
}

export interface DeviceApi {
  getDevice(id: string): Promise<DeviceInfo>;
  onDeviceUpdated(ev: (deviceId: string) => void): void;
  setDeviceProperty(
    deviceId: string,
    propertyName: string,
    schema: DevicePropertySchema,
    newValue: unknown
  ): Promise<void>;
  requestDeviceProperty(deviceId: string, propertyName: string): Promise<void>;
}

export class DeviceStore {
  api: DeviceApi;
  constructor(api: DeviceApi) {
    this.api = api;
    this.api.onDeviceUpdated((deviceId: string) => {
      if (deviceId === this.id) {
        (async (): Promise<void> => {
          this.device = await this.api.getDevice(this.id);
        })();
      }
    });
    makeAutoObservable(this);
  }
  id = "";
  @observable
  device: Readonly<DeviceInfo> = DeviceInfo.Empty;
  @observable
  expandedPropertyName = "";

  public initialize = async (id: string): Promise<void> => {
    if (this.id !== id) {
      this.id = id;
      this.device = await this.api.getDevice(id);
    }
  };

  public terminate = async (): Promise<void> => {
    //
  };

  public toggleOpenProperty = (propertyName: string): void => {
    this.startEdit(propertyName);
    if (this.expandedPropertyName !== propertyName) {
      this.expandedPropertyName = propertyName;
    } else {
      this.expandedPropertyName = "";
    }
  };

  public openSetPropertyDialog = (propertyName: string): (() => void) => {
    return (): void => {
      this.setPropertyDialogTarget = this.device.properties.find(
        (_) => _.name === propertyName
      );
      this.isSetPropertyDialogOpen = true;
    };
  };

  @observable
  public setPropertyDialogTarget: DeviceProperty | undefined = undefined;

  @observable
  public setPropertyDialogValue = "";

  @observable
  public isSetPropertyDialogOpen = false;

  public closeSetPropertyDialog = (): void => {
    this.isSetPropertyDialogOpen = false;
  };

  public uploadPropertyValue = async (): Promise<void> => {
    this.isSetPropertyDialogOpen = false;
  };

  @observable
  public editingValue: unknown = "";
  @observable
  public editingOriginal = "";
  @observable
  public editingPropertyName = "";

  public startEdit = (propertyName: string): void => {
    if (propertyName in this.device.propertyValues === false) {
      return;
    }

    this.editingPropertyName = propertyName;
    this.editingValue = this.device.propertyValues[propertyName];
    this.editingOriginal = this.device.propertyValues[propertyName];
  };

  public updateEditingValue = (newValue: unknown): void => {
    console.log(`DaviceStore.updateEditingValue newValue:${newValue}`);
    this.editingValue = newValue;
  };

  public updateValue = async (): Promise<void> => {
    if (this.editingPropertyName === "") {
      return;
    }
    const deviceProperty = this.device.properties.find(
      (_) => _.name === this.editingPropertyName
    );
    if (deviceProperty === undefined) {
      return;
    }

    this.api.setDeviceProperty(
      this.id,
      this.editingPropertyName,
      deviceProperty.schema,
      this.editingValue
    );
  };

  public reuqestValue = async (): Promise<void> => {
    if (this.editingPropertyName === "") {
      return;
    }

    await this.api.requestDeviceProperty(this.id, this.editingPropertyName);
  };
}

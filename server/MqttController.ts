import mqtt, { IPublishPacket, ISubscriptionGrant } from "mqtt";
import { DeviceStore } from "./DeviceStore";
import { ApiDevice, ApiDeviceProperty, ApiDeviceSummary } from "./ApiTypes";
import { Device } from "./Property";
import { ElDataType, ElPropertyDescription } from "./MraTypes";

export class MqttController
{
  readonly deviceStore:DeviceStore;
  mqttClient:mqtt.MqttClient | undefined;
  readonly mqttBroker:string;
  readonly mqttOption:mqtt.IClientOptions;
  readonly baseTopic:string;
  constructor(deviceStore:DeviceStore, mqttBroker:string, mqttOption:mqtt.IClientOptions, baseTopic:string){
    this.deviceStore =deviceStore;
    this.mqttBroker = mqttBroker;
    this.mqttOption = mqttOption;
    this.baseTopic = baseTopic;
  }

  public ConnectionState: "Connected"|"Disconnected"|"NotConfigure" = "Disconnected";

  public start = ():void =>{
    if(this.mqttBroker === "")
    {
      this.ConnectionState = "NotConfigure";
      this.fireConnectionStateChangedEvent();
      return;
    }
    console.log(`[MQTT] connect to ${this.mqttBroker} ...`);
    this.mqttClient = mqtt.connect(this.mqttBroker, this.mqttOption);
    
    this.mqttClient.on("connect", ()=>{
      this.ConnectionState = "Connected";
      console.log("[MQTT] connected");
      this.fireConnectionStateChangedEvent();

      this.publishAll();
    });
    this.mqttClient.on("error", (error:Error):void=>{
      console.log(error);
    })
    this.mqttClient.on("disconnect", ():void=>{
      this.ConnectionState = "Disconnected";
      console.log("[MQTT] disconnected");
      this.fireConnectionStateChangedEvent();
    });
    this.mqttClient.subscribe([
      `${this.baseTopic}/#`
    ], (err: Error, granted: ISubscriptionGrant[])=>{
      if(err !== null)
      {
        console.log("[MQTT] subscribe error: " + err);
      }
    });

    
    this.mqttClient.on("message", (topic: string, payload: Buffer, packet: IPublishPacket)=>{
      //console.log('subscriber.on.message', 'topic:', topic, 'message:', payload.toString());

      // set
      {
        const regex = RegExp(`${this.baseTopic}/([^/]+)/properties/([^/]+)/set`);
        const match = topic.match(regex);
        if(match!==null)
        {
          const deviceId = match[1];
          const propertyName = match[2];

          const foundDevice = this.deviceStore.getFromNameOrId(deviceId);
          if(foundDevice===undefined){
            //error
            return;
          }
          const property = foundDevice.properties.find(_=>_.name === propertyName);
          if(property===undefined){
            //error
            return;
          }
          
          //データのパース
          const bodyText = payload.toString();
          const newValue = this.parseValueFromText(bodyText, property.schema.data);

          this.firePropertyChnagedEvent(deviceId, propertyName, newValue);
        }
      }
      // request
      {
        const regex = RegExp(`${this.baseTopic}/([^/]+)/properties/([^/]+)/request`);
        const match = topic.match(regex);
        if(match!==null)
        {
          const deviceId = match[1];
          const propertyName = match[2];

          const foundDevice = this.deviceStore.getFromNameOrId(deviceId);
          if(foundDevice===undefined){
            //error
            return;
          }
          const property = foundDevice.properties.find(_=>_.name === propertyName);
          if(property===undefined){
            //error
            return;
          }

          this.firePropertyRequestedEvent(deviceId, propertyName);
        }
      }
    });
  }


  propertyChangedEventListeners:((deviceId:string, propertyName:string, value:any)=>void)[]=[];
  addPropertyChnagedEvent = (event:(deviceId:string, propertyName:string, value:any)=>void):void =>{
    this.propertyChangedEventListeners.push(event);
  };
  firePropertyChnagedEvent = (deviceId:string, propertyName:string, value:any):void=>{
    this.propertyChangedEventListeners.forEach(_=>_(deviceId, propertyName, value));
  }

  propertyRequestedEventListeners:((deviceId:string, propertyName:string)=>void)[]=[];
  addPropertyRequestedEvent = (event:(deviceId:string, propertyName:string)=>void):void =>{
    this.propertyRequestedEventListeners.push(event);
  };
  firePropertyRequestedEvent = (deviceId:string, propertyName:string):void=>{
    this.propertyRequestedEventListeners.forEach(_=>_(deviceId, propertyName));
  }

  connectionStateChangedEventListeners:(()=>void)[]=[];
  addConnectionStateChangedEvent = (event:()=>void):void =>{
    this.connectionStateChangedEventListeners.push(event);
  }
  fireConnectionStateChangedEvent = ():void =>{
    this.connectionStateChangedEventListeners.forEach(_=>_());
  }

  publishAll = ():void =>{
    this.publishDevices();
    const devices = this.deviceStore.getAll();
    for(const foundDevice of devices){
      this.publishDevice(foundDevice.id);
      this.publishDeviceProperties(foundDevice.id);
      for(const propertyName in foundDevice.propertiesValue){
        this.publishDeviceProperty(foundDevice.id, propertyName);
      }
    }
  }

  publishDevices = ():void =>{
    if(this.mqttClient===undefined){
      return;
    }
    const result = this.deviceStore.getAll().map((_:Device):ApiDeviceSummary=>(
      {
        id: _.id,
        name: _.name,
        deviceType: _.deviceType,
        protocol: _.protocol,
        manufacturer: _.manufacturer,
        eoj: _.eoj,
        ip: _.ip,
        mqttTopics: `${this.baseTopic}/${_.name}`
      }
    ));

    this.mqttClient.publish(`${this.baseTopic}`, JSON.stringify(result), {
      retain:true
    });
  }
  publishDevice = (deviceId:string):void =>{
    if(this.mqttClient===undefined){
      return;
    }
    const foundDevice = this.deviceStore.getFromNameOrId(deviceId);
    if(foundDevice===undefined){
      // error
      return;
    }

    const result: ApiDevice = {
      id: foundDevice.id,
      eoj: foundDevice.eoj,
      name: foundDevice.name,
      actions:[],
      deviceType: foundDevice.deviceType,
      events:[],
      descriptions:foundDevice.descriptions,
      properties:[],
      ip: foundDevice.ip,
      mqttTopics: `${this.baseTopic}/${foundDevice.name}`,
      propertyValues: Device.ToProperiesObject(foundDevice.propertiesValue),
      values: foundDevice.propertiesValue
    };
    result.properties = foundDevice.properties.map((_):ApiDeviceProperty =>({
      epc: _.epc,
      descriptions: _.descriptions,
      epcAtomic: _.epc,
      note:{
        en:"",
        ja:""
      },
      observable: _.observable,
      writable: _.writable,
      schema: _.schema,
      urlParameters:[],
      mqttTopics: `${this.baseTopic}/${foundDevice.name}/properties/${_.name}`,
      name: _.name
    }));
    this.mqttClient.publish(`${this.baseTopic}/${foundDevice.name}`, JSON.stringify(result), {
      retain:true
    });

    if(foundDevice.id !== foundDevice.name)
    {
      this.mqttClient.publish(`${this.baseTopic}/${foundDevice.id}`, JSON.stringify(result), {
        retain:true
      });
    }
  }

  publishDeviceProperties = (deviceId:string):void =>{
    if(this.mqttClient===undefined){
      return;
    }
    const foundDevice = this.deviceStore.getFromNameOrId(deviceId);
    if(foundDevice === undefined){
      // error
      return;
    }
    this.mqttClient.publish(`${this.baseTopic}/${foundDevice.name}/properties`, JSON.stringify(Device.ToProperiesObject(foundDevice.propertiesValue)), {
      retain:true
    });
    if(foundDevice.id !== foundDevice.name)
    {
      this.mqttClient.publish(`${this.baseTopic}/${foundDevice.id}/properties`, JSON.stringify(Device.ToProperiesObject(foundDevice.propertiesValue)), {
        retain:true
      });
    }
  }
  
  publishDevicePropertiesAndAllProperty = (deviceId:string):void =>{
    if(this.mqttClient===undefined){
      return;
    }

    const foundDevice = this.deviceStore.getFromNameOrId(deviceId);
    if(foundDevice === undefined){
      // error
      return;
    }
    this.publishDeviceProperties(deviceId);
    for(const propertyName in foundDevice.propertiesValue)
    {
      this.publishDeviceProperty(deviceId, propertyName);
    }
  }
  publishDeviceProperty = (deviceId:string, propertyName:string):void =>{
    if(this.mqttClient===undefined){
      return;
    }
    const foundDevice = this.deviceStore.getFromNameOrId(deviceId);
    if(foundDevice === undefined){
      // error
      return;
    }
    if((propertyName in foundDevice.propertiesValue)===false){
      // error
      return ;
    }
    const valueText = this.getValueText(foundDevice.propertiesValue[propertyName].value, foundDevice.propertiesValue[propertyName].deviceProperty.schema.data);
    this.mqttClient.publish(`${this.baseTopic}/${foundDevice.name}/properties/${propertyName}`, valueText, {retain:true});
    if(foundDevice.id !== foundDevice.name)
    {
      this.mqttClient.publish(`${this.baseTopic}/${foundDevice.id}/properties/${propertyName}`, valueText, {retain:true});
    }
  }

  private getValueText = (value: unknown, dataType:ElDataType): string => {
    if(value === undefined){
      return "undefined"
    }
    
    if("type" in dataType)
    {
      if(dataType.type === "array")
      {
        return JSON.stringify(value);
      }
      if(dataType.type === "bitmap")
      {
        return JSON.stringify(value);
      }
      if(dataType.type === "date")
      {
        return (value as any).toString();
      }
      if(dataType.type === "date-time")
      {
        return (value as any).toString();
      }
      if(dataType.type === "time")
      {
        return (value as any).toString();
      }
      if(dataType.type === "level")
      {
        return (value as any).toString();
      }
      if(dataType.type === "number")
      {
        return (value as any).toString();
      }
      if(dataType.type === "numericValue")
      {
        return (value as any).toString();
      }
      if(dataType.type === "object")
      {
        return JSON.stringify(value);
      }
      if(dataType.type === "raw")
      {
        return (value as any).toString();
      }
      if(dataType.type === "state")
      {
        return (value as any).toString();
      }
      return "undefined";
    }
    else
    {
      if("oneOf" in dataType)
      {
        if(typeof value === "object")
        {
          return JSON.stringify(value);
        }
        if(value === undefined){
          return "undefined"
        }
        return (value as any).toString();
      }
      else
      {
        return "undefined";
      }
    }
  };

  private parseValueFromText = (valueText: string, dataType:ElDataType): any => {
    
    if("type" in dataType)
    {
      if(dataType.type === "array")
      {
        if(valueText.startsWith("[") === false || valueText.endsWith("]") === false)
        {
          return undefined;
        }
        return JSON.parse(valueText);
      }
      if(dataType.type === "bitmap")
      {
        if(valueText.startsWith("{") === false || valueText.endsWith("}") === false)
        {
          return undefined;
        }
        return JSON.parse(valueText);
      }
      if(dataType.type === "date")
      {
        return valueText;
      }
      if(dataType.type === "date-time")
      {
        return valueText;
      }
      if(dataType.type === "time")
      {
        return valueText;
      }
      if(dataType.type === "level")
      {
        const valueNum = Number(valueText);
        if(isNaN(valueNum)){
          return undefined;
        }
        return valueNum;
      }
      if(dataType.type === "number")
      {
        const valueNum = Number(valueText);
        if(isNaN(valueNum)){
          return undefined;
        }
        return valueNum;
      }
      if(dataType.type === "numericValue")
      {
        const valueNum = Number(valueText);
        if(isNaN(valueNum)){
          return undefined;
        }
        return valueNum;
      }
      if(dataType.type === "object")
      {
        if(valueText.startsWith("{") === false || valueText.endsWith("}") === false)
        {
          return undefined;
        }
        return JSON.parse(valueText);
      }
      if(dataType.type === "raw")
      {
        return valueText;
      }
      if(dataType.type === "state")
      {
        return valueText;
      }
      return undefined;
    }
    else
    {
      if("oneOf" in dataType)
      {
        for(const subSchema of dataType.oneOf)
        {
          const result = this.parseValueFromText(valueText, subSchema);
          if(result !== undefined)
          {
            return result;
          }
        }
        return undefined;
      }
      else
      {
        //data.$ref
        return undefined;
      }
    }
  };
}

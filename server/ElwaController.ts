import mqtt, { IPublishPacket, ISubscriptionGrant } from "mqtt";
import { DeviceStore } from "./DeviceStore";
import { Device } from "./Property";
import { Logger } from "./Logger";
import { MqttController } from "./MqttController";
import { ElStateType } from "./MraTypes";

export class ElwaController
{
  readonly deviceStore:DeviceStore;
  mqttClient:mqtt.MqttClient | undefined;
  syncMqttClient:SyncMqttClient | undefined;
  readonly mqttBroker:string;
  readonly mqttOption:mqtt.IClientOptions;
  readonly clientToken:string;
  readonly commandTimeout:number;
  constructor(deviceStore:DeviceStore, mqttBroker:string, mqttOption:mqtt.IClientOptions, clientToken:string, commandTimeout:number){
    this.deviceStore =deviceStore;
    this.mqttBroker = mqttBroker;
    this.mqttOption = mqttOption;
    this.clientToken = clientToken;
    this.commandTimeout = commandTimeout
  }

  public ConnectionState: "Connected"|"Disconnected"|"NotConfigure" = "NotConfigure";

  public start = async ():Promise<void> =>{
    if(this.mqttBroker === "")
    {
      this.ConnectionState = "NotConfigure";
      this.fireConnectionStateChangedEvent();
      return;
    }
    Logger.info("[ELWA]", `connect to ${this.mqttBroker} ...`);
    const mqttClient = mqtt.connect(this.mqttBroker, this.mqttOption);
    this.mqttClient = mqttClient;
    

    this.mqttClient.on("error", (error:Error):void=>{
      Logger.warn("[ELWA]", error?.toString() ?? "");
    })

    await new Promise<void>((resolve, reject)=>{
      mqttClient.on("connect", ()=>{
        this.ConnectionState = "Connected";
        Logger.info("[ELWA]", "connected");
        this.fireConnectionStateChangedEvent();

        resolve();
      });
    });

    this.mqttClient.on("disconnect", ():void=>{
      this.ConnectionState = "Disconnected";
      Logger.info("[ELWA]", "disconnected");
      this.fireConnectionStateChangedEvent();
    });

    this.syncMqttClient = new SyncMqttClient(this.mqttClient, `/client/${this.clientToken}/cmdreport`, this.commandTimeout);

    this.mqttClient.on("message", async (topic: string, payload: Buffer, packet: IPublishPacket):Promise<void>=>{

      if(this.syncMqttClient !== undefined){
        await this.syncMqttClient.receiveMessage(topic, payload.toString());
      }

      // /client/{clientToken}/{deviceId}/properties/{propertyName} の場合は、サーバーからのプロパティ変更要求
      const match = topic.match(/^\/client\/([^\/]+)\/([^\/]+)\/properties\/([^\/]+)$/);
      if(match !== null){
        const clientToken = match[1];
        const deviceId = match[2];
        const propertyName = match[3];
        const device = this.deviceStore.get(deviceId);
        if(device === undefined){
          Logger.error("[ELWA]", `device not found ${deviceId}`);
          return;
        }
        const property = device.properties.find(_=>_.name === propertyName);
        if(property === undefined){
          Logger.error("[ELWA]", `property not found ${deviceId}/${propertyName}`);
          return;
        }
        const value = JSON.parse(payload.toString());
        if(!(propertyName in value))
        {
          Logger.error("[ELWA]", `property not found in payload ${deviceId}/${propertyName}`);
          return;
        }
        const newValueText = value[propertyName].toString() as string;

        Logger.info("[ELWA]", `property changed ${deviceId}/${propertyName} = ${newValueText}`);
        // プロパティを変換
        const newValue = MqttController.parseValueFromText(newValueText, property.schema.data);
        await this.firePropertyChnagedEvent(deviceId, propertyName, newValue);

        this.syncMqttClient?.publishAsync(`/server/${this.clientToken}/cmdreport`, {topic:topic, status: 200, note:""}, {});
      }
    });
  }

  connectionStateChangedEventListeners:(()=>void)[]=[];
  addConnectionStateChangedEvent = (event:()=>void):void =>{
    this.connectionStateChangedEventListeners.push(event);
  }
  fireConnectionStateChangedEvent = ():void =>{
    this.connectionStateChangedEventListeners.forEach(_=>_());
  }

  propertyChangedEventListeners:((deviceId:string, propertyName:string, value:any)=>Promise<void>)[]=[];
  addPropertyChnagedEvent = (event:(deviceId:string, propertyName:string, value:any)=>Promise<void>):void =>{
    this.propertyChangedEventListeners.push(event);
  };
  firePropertyChnagedEvent = async (deviceId:string, propertyName:string, value:any):Promise<void>=>{
    for(const listener of this.propertyChangedEventListeners)
    {
      await listener(deviceId, propertyName, value);
    }
  }


  registerAll = async ():Promise<void> =>{
    const devices = this.deviceStore.getAll();
    for(const device of devices)
    {
      await this.registerDevice(device);
    }
  }
  registerDevice = async (device:Device):Promise<void> =>{
    if(this.syncMqttClient === undefined){
      return;
    }
    if(device.deviceType === "nodeProfile")
    {
      return;
    }
    if(device.deviceType.startsWith("Unknown_"))
    {
      return;
    }

    // register
    {
      // registerの場合、レスポンス内のtopicは2種類ある
      // 1. /server/{clientToken}/{deviceId} ... この場合は、登録が成功したことを示す。重複エラーの場合もこちら。
      // 2. /server/{clientToken}/register ... この場合は、登録が失敗したことを示す。
      Logger.info("[ELWA]", `register ${device.id} ...`);
      const res = await this.syncMqttClient.publishAndWaitResponse(`/server/${this.clientToken}/register`, {id:device.id, deviceType: device.deviceType},
         {}, [`/server/${this.clientToken}/${device.id}`, `/server/${this.clientToken}/register`]);
      if(res.status !== 400 && res.status !== 201){
        Logger.error("[ELWA]", `error register ${device.id}: ${JSON.stringify(res)}`);
        return;
      }
      if(res.status === 400 && res.topic === `/server/${this.clientToken}/register`){
        // Idが返ってこなかったので、登録時にエラーになったと思われる
        Logger.error("[ELWA]", `error register ${device.id}: ${JSON.stringify(res)}`);
        return;
      }
    }

    // set properties
    {
      const propertiesPayload = this.createMqttPayloadForAllProperties(device);

      Logger.info("[ELWA]", `set properties ${device.id} ...`);
      const res = await this.syncMqttClient.publishAndWaitResponse(`/server/${this.clientToken}/${device.id}/properties`, propertiesPayload, {});
      if(res.status !== 201){

        Logger.error("[ELWA]", `error set properties ${device.id}: ${JSON.stringify(res)}`);
        return;
      }

      // 登録したプロパティはサブスクライブを始める
      const propertyNames = Object.keys(propertiesPayload);
      const subscribeList = propertyNames.map(propertyName=>`/client/${this.clientToken}/${device.id}/properties/${propertyName}`);
      this.mqttClient?.subscribe(subscribeList);
    }
  }

  public publishDeviceProperty = (deviceId:string, propertyName:string):void =>{
    if(this.mqttClient===undefined){
      return;
    }
    const foundDevice = this.deviceStore.getFromNameOrId(deviceId);
    if(foundDevice === undefined){
      Logger.error("[ELWA]", `device not found ${deviceId}`);
      return;
    }
    if((propertyName in foundDevice.propertiesValue)===false){
      Logger.error("[ELWA]", `property not found ${deviceId}/${propertyName}`);
      return ;
    }

    const payload = this.createMqttPayloadForProperty(foundDevice, propertyName);

    Logger.info("[ELWA]", `publish ${deviceId}/${propertyName} ...`);
    this.syncMqttClient?.publishAndWaitResponse(`/server/${this.clientToken}/${foundDevice.id}/properties/${propertyName}`, payload, {});
  }


  private createMqttPayloadForAllProperties = (device:Device):{[key:string]:any} =>
  {
    const result:{[key:string]:any}= {};
    for(const property of device.properties)
    {
      const val = this.createMqttPayloadForProperty(device, property.name);
      result[property.name] = val[property.name];
    }
    
    // プロトコルとメーカーを追加
    result["protocol"] = device.protocol;
    result["manufacturer"] = device.manufacturer;
    return result;
  }
  
  private createMqttPayloadForProperty = (device:Device, propertyName:string):{[key:string]:any} =>
  {
    const result:{[key:string]:any}= {};
    result[propertyName] = device.propertiesValue[propertyName].value;
    
    // WebApi用の独自変換を挟むならここで

    // stateTypeがbooleanの場合は、文字列からbooleanに変換
    if(this.isBooleanProperty(device, propertyName))
    {
      result[propertyName] = result[propertyName] === "true";
    }
    return result;
  }
  
  private isBooleanProperty = (device:Device, propertyName:string):boolean =>
  {
    const property = device.properties.find(_=>_.name === propertyName);
    if(property === undefined)
    {
      return false;
    }
    if(ElStateType.isTypeOf(property.schema.data))
    {
      if(property.schema.data.enum.length !== 2)
      {
        return false;
      }
      if(property.schema.data.enum[0].name === "true" && property.schema.data.enum[1].name === "false" ||
        property.schema.data.enum[1].name === "true" && property.schema.data.enum[0].name === "false")
      {
        return true;
      }
    }
    return false;
  }
}


// 同期でMQTTにリクエストを送信し、レスポンスを待つクライアント
export class SyncMqttClient
{
  readonly mqttClient:mqtt.MqttClient;
  requestQueue:MqttResponseReceiver[] = [];
  currentReceiver:MqttResponseReceiver | undefined = undefined;
  processing:boolean = false;
  readonly responseTopic:string;
  readonly responseTimeout:number;

  constructor(mqttClient:mqtt.MqttClient, responseTopic:string, responseTimeout:number){
    this.mqttClient = mqttClient;
    this.responseTopic = responseTopic;
    this.responseTimeout = responseTimeout;

    this.mqttClient.subscribe(responseTopic);
  }

  // レスポンスを受信したときに呼び出される
  async receiveMessage(topic:string, payload:string):Promise<void>
  {
    if(topic !== this.responseTopic){
      return;
    }
    if(this.currentReceiver === undefined){
      return;
    }

    const response = JSON.parse(payload.toString()) as MqttResponsePacket;
    if(this.currentReceiver.isMatch(response) === true)
    {
      this.currentReceiver.setResponse(response);
      return;
    }
  }
  
  // レスポンスを待たないで送信する
  async publishAsync(topic:string, message:object, options:mqtt.IClientPublishOptions, expectedResponseTopics:string[] = []):Promise<void>
  {
    if(this.mqttClient === undefined){
      throw new Error("想定外エラー");
    }

    const receiver = new MqttResponseReceiver({
      topic:topic,
      payload:message,
      options:options,
      expectedResponseTopics: expectedResponseTopics.length!==0 ? expectedResponseTopics : [topic]
    });
    this.requestQueue.push(receiver);
    this.processQueue();
  }

  // Publishしてレスポンスを待つ
  async publishAndWaitResponse(topic:string, message:object, options:mqtt.IClientPublishOptions, expectedResponseTopics:string[] = []):Promise<MqttResponsePacket>{
    if(this.mqttClient === undefined){
      throw new Error("想定外エラー");
    }

    return new Promise<MqttResponsePacket>((resolve, reject)=>{
      const receiver = new MqttResponseReceiver({
        topic:topic,
        payload:message,
        options:options,
        expectedResponseTopics: expectedResponseTopics.length!==0 ? expectedResponseTopics : [topic]
      });
      receiver.onReceiveResponse((res)=>{
        resolve(res);
      });
      this.requestQueue.push(receiver);
      this.processQueue();
    });  
  }

  processQueue = async ():Promise<void>=>{
    if(this.processing){
      return;
    }
    this.processing = true;
    while(this.requestQueue.length > 0)
    {
      const packet = this.requestQueue.shift();
      if(packet === undefined){
        continue;
      }

      this.currentReceiver = packet;
      this.mqttClient?.publish(packet.request.topic, JSON.stringify(packet.request.payload), packet.request.options);

      const timeoutHandle = setTimeout(()=>{
        packet.setResponse({topic:packet.request.expectedResponseTopics[0], status:500, note:"timeout"});
      }, this.responseTimeout);

      await new Promise<void>((resolve, reject)=>{
        packet.onReceiveResponse((res)=>{
          clearTimeout(timeoutHandle);
          resolve();
        });
      });
      this.currentReceiver = undefined;
    }
    this.processing = false;
  }


}

// MQTT送信パケット
interface MqttPacket
{
  topic:string;
  payload:object;
  options:mqtt.IClientPublishOptions;
  expectedResponseTopics:string[];
}

class MqttResponseReceiver
{
  request:MqttPacket;
  response:MqttResponsePacket | undefined = undefined;
  eventHandlers:((response:MqttResponsePacket)=>void)[] = [];
  constructor(request:MqttPacket){
    this.request = request;
  }
  onReceiveResponse = (handler:((response:MqttResponsePacket)=>void)):void =>{
    this.eventHandlers.push(handler);
  }
  setResponse = (response:MqttResponsePacket):void =>{
    if(this.response !== undefined){
      return;
    }
    this.response = response;
    this.eventHandlers.forEach(_=>_(response));
  }
  isMatch = (response:MqttResponsePacket):boolean =>{
    return this.request.expectedResponseTopics.indexOf(response.topic) !== -1;
  }
}

// MQTTレスポンスパケット
interface MqttResponsePacket
{
  topic:string;
  status:number;
  note:string;
}


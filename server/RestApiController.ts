import express from "express";
import { ApiDevice, ApiDeviceProperty, ApiDeviceSummary, ApiService, ApiVersion, ServerStatus, SystemStatusRepositry } from "./ApiTypes";
import { DeviceStore } from "./DeviceStore";
import { EventRepository } from "./EventRepository";
import { LogRepository } from "./LogRepository";
import { device } from "./Property";

export class RestApiController
{
  private readonly deviceStore:DeviceStore;
  private readonly systemStatusRepository:SystemStatusRepositry;
  private readonly logRepository:LogRepository;
  private readonly hostName:string;
  private readonly port:number;
  constructor(deviceStore:DeviceStore, 
    systemStatusRepository:SystemStatusRepositry,
    eventRepository:EventRepository, 
    logRepository:LogRepository,
     hostName:string, 
     port:number){

    this.deviceStore = deviceStore;
    this.systemStatusRepository = systemStatusRepository;
    this.eventRepository = eventRepository;
    this.logRepository = logRepository;
    this.hostName = hostName;
    this.port = port;

    setInterval(this.timeoutLongPolling, 10*1000);
  }

  public start = ():void=>{
    const app = express();

    app.use(express.static("./front/build"));

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.get("/status", this.getStatus);
    //app.get("/logs", getLogs);
    app.get("/elapi", this.getVersions);
    app.get("/elapi/v1", this.getServices);
    app.get("/elapi/v1/devices", this.getDevices);
    app.get("/elapi/v1/devices/:deviceId", this.getDevice);
    app.get("/elapi/v1/devices/:deviceId/properties", this.getProperties);
    app.get("/elapi/v1/devices/:deviceId/properties/:propertyName", this.getProperty);
    
    app.put("/elapi/v1/devices/:deviceId/properties/:propertyName", this.putProperty);
    app.put("/elapi/v1/devices/:deviceId/properties/:propertyName/request", this.requestProperty);

    app.get("/events", this.getEventsWithLongPolling);
    app.get("/logs", this.getLogs);

    const server = app.listen(this.port, this.hostName, ():void => {
      console.log(`[RESTAPI] Start listening to web server. ${this.hostName}:${this.port}`);
    });
  }

  private readonly propertyChangedRequestEvents:((deviceId:string,propertyName:string,newValue:any)=>void)[] = [];
  public addPropertyChangedRequestEvent = (event:(deviceId:string,propertyName:string,newValue:any)=>void):void =>{
    this.propertyChangedRequestEvents.push(event);
  }
  private firePropertyChangedRequestEvent = (deviceId:string,propertyName:string,newValue:any):void=>{
    this.propertyChangedRequestEvents.forEach(_=>_(deviceId, propertyName, newValue));
  }

  private readonly propertyRequestedRequestEvents:((deviceId:string,propertyName:string)=>void)[] = [];
  public addPropertyRequestedRequestEvent = (event:(deviceId:string,propertyName:string)=>void):void =>{
    this.propertyRequestedRequestEvents.push(event);
  }
  private firePropertyRequestedRequestEvent = (deviceId:string,propertyName:string):void=>{
    this.propertyRequestedRequestEvents.forEach(_=>_(deviceId, propertyName));
  }


  private getVersions = (
    req: express.Request,
    res: express.Response
  ): void => {
    const result: ApiVersion[] = [
      {
        id:"v1",
        status: "CURRENT",
        updated: "2021-09-21T00:00:00+09:00"
      }
    ]
    res.json(result);
  }
  
  private getServices = (
    req: express.Request,
    res: express.Response
  ): void =>  {
    
    const result: ApiService[] = [
      {
        name:"devices",
        descriptions:{
          ja:"デバイス",
          en:"device"
        },
        total: this.deviceStore.getIds().length
      }
    ];
    res.json(result);
  }
  
  private getDevices = (
    req: express.Request,
    res: express.Response
  ): void => {
    const result = this.deviceStore.getAll().map((_:device):ApiDeviceSummary=>(
      {
        id: _.id,
        deviceType: _.deviceType,
        protocol: _.protocol,
        manufacturer: _.manufacturer,
        eoj: _.eoj,
        ip: _.ip,
        mqttTopics: `echonetlite2mqtt/elapi/v1/devices/${_.id}`
      }
    ));
    
    res.json(result);
  }
  
  
  private getDevice = (
    req: express.Request,
    res: express.Response
  ): void => {
    const deviceId = req.params.deviceId;
    const device = this.deviceStore.get(deviceId);
    if(device === undefined){
      res.status(404);
      res.end('device not found : ' + deviceId);
      return;
    }
  
    const result: ApiDevice = {
      id: device.id,
      eoj: device.eoj,
      actions:[],
      deviceType: device.deviceType,
      events:[],
      descriptions:device.descriptions,
      properties:[],
      ip: device.ip,
      mqttTopics: `echonetlite2mqtt/elapi/v1/devices/${device.id}`,
      propertyValues: device.propertiesValue
    };
    result.properties = device.properties.map((_):ApiDeviceProperty =>({
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
      mqttTopics: `echonetlite2mqtt/elapi/v1/devices/${device.id}/properties/${_.name}`,
      name: _.name
    }));
    res.json(result);
    
  }
  
  private getProperties = (
    req: express.Request,
    res: express.Response
  ): void => {
    const deviceId = req.params.deviceId;
    const device = this.deviceStore.get(deviceId);
    if(device === undefined){
      res.status(404);
      res.end('device not found : ' + deviceId);
      return;
    }
    
    res.json(device.propertiesValue);
  }
  private getProperty = (
    req: express.Request,
    res: express.Response
  ): void => {
    const deviceId = req.params.deviceId;
    const propertyName = req.params.propertyName;
    const device = this.deviceStore.get(deviceId);
    if(device === undefined){
      res.status(404);
      res.end('device not found : ' + deviceId);
      return;
    }
    if((propertyName in device.propertiesValue)===false)
    {
      res.status(404);
      res.end('property not found : ' + propertyName);
      return;
    }
    const result: {[key:string]:any} = {
    };
    result[propertyName] = device.propertiesValue[propertyName];
    res.json(result);
  }
  
  private putProperty = (
    req: express.Request,
    res: express.Response
  ): void => {
    const deviceId = req.params.deviceId;
    const propertyName = req.params.propertyName;
    const newValue = req.body[propertyName];
  
    console.log(`[RESTAPI] put property: ${deviceId}\t${propertyName}\t${newValue}`)
  
    const device = this.deviceStore.get(deviceId);
    if(device === undefined){
      res.status(404);
      res.end('device not found : ' + deviceId);
      console.log('device not found : ' + deviceId)
      return;
    }
    if((propertyName in device.propertiesValue)===false)
    {
      res.status(404);
      res.end('property not found : ' + propertyName);
      console.log('property not found : ' + propertyName)
      return;
    }
  
    if((propertyName in req.body)===false){
      res.status(404);  //Bad Request
      res.end('Bad Request : ' + JSON.stringify(req.body));
      console.log('Bad Request : ' + JSON.stringify(req.body));
      return;
    }
  
    this.firePropertyChangedRequestEvent(deviceId, propertyName, newValue);
  
    const result:{[key:string]:any} = {};
    result[propertyName] = device.propertiesValue[propertyName];
    res.json(result);
  }

  private requestProperty = (
    req: express.Request,
    res: express.Response
  ): void => {
    const deviceId = req.params.deviceId;
    const propertyName = req.params.propertyName;
  
    console.log(`[RESTAPI] request property: ${deviceId}\t${propertyName}`)
  
    const device = this.deviceStore.get(deviceId);
    if(device === undefined){
      res.status(404);
      res.end('device not found : ' + deviceId);
      console.log('device not found : ' + deviceId)
      return;
    }
    if((propertyName in device.propertiesValue)===false)
    {
      res.status(404);
      res.end('property not found : ' + propertyName);
      console.log('property not found : ' + propertyName)
      return;
    }
  
    this.firePropertyRequestedRequestEvent(deviceId, propertyName);
  
    res.json({});
  }


  private getStatus = (
    req: express.Request,
    res: express.Response
  ): void => {
    const result:ServerStatus = {
      mqttState: this.systemStatusRepository.SystemStatus.mqttState,
      devices:[]
    };
    result.devices = this.deviceStore.getAll().map((_):ApiDeviceSummary=>(
      {
        id: _.id,
        eoj: _.eoj,
        ip: _.ip,
        deviceType: _.deviceType,
        manufacturer: _.manufacturer,
        mqttTopics: `echonetlite2mqtt/elapi/v1/devices/${_.id}`,
        protocol:_.protocol
      }
    ))
  
    res.json(result);
  }
  private getLogs = (
    req: express.Request,
    res: express.Response
  ): void => {
    const logs = this.logRepository.logs;
    res.json(logs);
    res.end();
  }


  readonly eventRepository:EventRepository;

  waitingResponseList: {lastEventId:string, res:express.Response}[] = [];
  private getEventsWithLongPolling =  (
    req: express.Request,
    res: express.Response
  ): void => {

    
    const lastEventId = req.query.lastEvent as string;
    
    if(this.eventRepository.existsNewEvents(lastEventId)){
      const newEvents = this.eventRepository.getNewEvents(lastEventId);
      //console.log(`new EVENT:${lastEventId} !== ${this.eventRepository.lastId}`)
      res.json(newEvents);
      res.end();
      return;
    }

    this.waitingResponseList.push({
      lastEventId,
      res
    });
  }

  public setNewEvent = ():void => {
    this.waitingResponseList.forEach(_=>{
      const newEvents = this.eventRepository.getNewEvents(_.lastEventId);
      _.res.json(newEvents);
      _.res.end();
      //console.log(`no  EVENT:${_.lastEventId}`)
    });
    this.waitingResponseList = [];
  }

  private timeoutLongPolling = ():void =>{
    this.waitingResponseList.forEach(_=>{
      const newEvents = this.eventRepository.getNewEvents(_.lastEventId);
      _.res.json(newEvents);
      _.res.end();
      //console.log(`no  EVENT:${_.lastEventId}`)
    });
    this.waitingResponseList = [];
  }
}

import express from "express";
import { ApiDevice, ApiDeviceProperty, ApiDeviceSummary, ApiService, ApiVersion, ServerStatus, SystemStatusRepositry } from "./ApiTypes";
import { DeviceStore } from "./DeviceStore";
import { EventRepository } from "./EventRepository";
import { LogRepository } from "./LogRepository";
import { Device } from "./Property";
import expressLayouts from 'express-ejs-layouts';
import { ElDataType, ElMixedOneOfType } from "./MraTypes";
import admZip from 'adm-zip';
import { EchoNetLiteController } from "./EchoNetLiteController";
import { Logger } from "./Logger";
import path from "path";
import crypto from "crypto";
import { RestApiOpenApiConverter } from "./RestApiOpenApiConverter";
import swaggerUi from 'swagger-ui-express';

interface ViewProperty{
  propertyName:string;
  valueText: string;
  inputHtml: string;
}


export class RestApiController
{
  private readonly deviceStore:DeviceStore;
  private readonly systemStatusRepository:SystemStatusRepositry;
  private readonly logRepository:LogRepository;
  private readonly echoNetLiteController:EchoNetLiteController;
  private readonly hostName:string;
  private readonly port:number;
  private readonly root:string;
  private readonly mqttBaseTopic:string;
  private readonly detailLogsCallback:()=>{fileName:string, content:string}[];
  constructor(deviceStore:DeviceStore, 
    systemStatusRepository:SystemStatusRepositry,
    eventRepository:EventRepository, 
    logRepository:LogRepository,
    echoNetLiteController:EchoNetLiteController,
    hostName:string, 
    port:number,
    root:string,
    mqttBaseTopic:string,
    detailLogsCallback:()=>{fileName:string, content:string}[]){

    this.deviceStore = deviceStore;
    this.systemStatusRepository = systemStatusRepository;
    this.eventRepository = eventRepository;
    this.logRepository = logRepository;
    this.echoNetLiteController = echoNetLiteController;
    this.hostName = hostName;
    this.port = port;
    this.root = root;
    this.mqttBaseTopic = mqttBaseTopic;
    this.detailLogsCallback = detailLogsCallback;

    setInterval(this.timeoutLongPolling, 10*1000);
  }

  public start = ():void=>{
    const app = express();

    app.use(expressLayouts);
    app.use(express.static("public"));
    app.set("view engine", "ejs");

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Views
    app.get("/", this.viewIndex);
    app.get("/logs", this.viewLogs);
    app.get("/devices", this.viewIndex);
    app.get("/devices/:deviceId", this.viewDevice);


    // APIs
    app.get("/elapi", this.getVersions);
    app.get("/elapi/v1", this.getServices);
    app.get("/elapi/v1/devices", this.getDevices);
    app.get("/elapi/v1/devices/:deviceId", this.getDevice);
    app.get("/elapi/v1/devices/:deviceId/properties", this.getProperties);
    app.get("/elapi/v1/devices/:deviceId/properties/:propertyName", this.getProperty);

    app.put("/elapi/v1/devices/:deviceId/properties/request", this.requestProperties);

    
    app.put("/elapi/v1/devices/:deviceId/properties/:propertyName", this.putProperty);
    app.put("/elapi/v1/devices/:deviceId/properties/:propertyName/request", this.requestProperty);

    app.get("/api/status", this.getStatus);
    app.get("/api/events", this.getEventsWithLongPolling);  // OBSOLETE
    app.get("/api/logs", this.getLogs);
    
    app.get("/downloadlogs/zip", this.downloadLogs);

    app.get("/openapi.json", this.getOpenApiJson);

    app.get("/api/serverevents", this.getServerEvents);

    // openapi-ui
    const jsonObj = this.createOpenApiJson();
    const swaggerUiOptions:swaggerUi.SwaggerOptions = {customfavIcon:"/favicon.ico", swaggerOptions:{}};
    app.use('/api-docs', swaggerUi.serveFiles(jsonObj, swaggerUiOptions), swaggerUi.setup(jsonObj, swaggerUiOptions));
    
    const server = app.listen(this.port, this.hostName, ():void => {
      Logger.info("[RESTAPI]", `Start listening to web server. ${this.hostName}:${this.port}`);
    });
  }

  private readonly propertyChangedRequestEvents:((deviceId:string,propertyName:string,newValue:any)=>Promise<void>)[] = [];
  public addPropertyChangedRequestEvent = (event:(deviceId:string,propertyName:string,newValue:any)=>Promise<void>):void =>{
    this.propertyChangedRequestEvents.push(event);
  }
  private firePropertyChangedRequestEvent = async (deviceId:string,propertyName:string,newValue:any):Promise<void>=>{
    for(const event of this.propertyChangedRequestEvents)
    {
      await event(deviceId, propertyName, newValue);
    }
  }

  private readonly propertyRequestedRequestEvents:((deviceId:string,propertyName:string)=>void)[] = [];
  public addPropertyRequestedRequestEvent = (event:(deviceId:string,propertyName:string)=>Promise<void>):void =>{
    this.propertyRequestedRequestEvents.push(event);
  }
  private firePropertyRequestedRequestEvent = async (deviceId:string,propertyName:string):Promise<void>=>{
    for(const event of this.propertyRequestedRequestEvents)
    {
      await event(deviceId, propertyName);
    }
  }

  private viewIndex = (
    req: express.Request,
    res: express.Response
  ): void => {
    const root = this.root;
    res.render("./index.ejs", {root:root});
  }

  private viewLogs = (
    req: express.Request,
    res: express.Response
  ): void => {
    const root = this.root;
    res.render("./logs.ejs", {root:root});
  }

  private viewDevice = (
    req: express.Request,
    res: express.Response
  ): void => {
    const root = this.root;
    const deviceId = req.params.deviceId;
    const foundDevice = this.deviceStore.getFromNameOrId(deviceId);
    if(foundDevice === undefined){
      res.status(404);
      res.end('device not found : ' + deviceId);
      return;
    }
    const propertyViewModels = this.toUIData(foundDevice);

    const mqttTopic = `${this.mqttBaseTopic}/${foundDevice.name}`;

    const allProperties = JSON.stringify(Device.ToProperiesObject(foundDevice.propertiesValue), null, 2);
    res.render("./device.ejs", {device:foundDevice, allProperties, propertyViewModels, context:{mqttTopic}, root:root});
  }


  private createDeviceInputHtml(dataType:ElDataType, propertyChain:string[], propertiesValue:unknown):string{
    const id = `property-${propertyChain.join("-")}`;
    if("type" in dataType)
    {
      if(dataType.type === "array")
      {
        const results = [];
        results.push(`<table class="table table-bordered"><tbody>`);
        
        for(let i = 0; i < dataType.maxItems; i++)
        {
          const itemValue = Array.isArray(propertiesValue) ? propertiesValue[i] : undefined;

          results.push(`<tr><td>${i}</td><td>`);
          const subTypeHtml = this.createDeviceInputHtml(dataType.items, [...propertyChain, `_array${i}`], itemValue);
          results.push(subTypeHtml);
          results.push(`</td></tr>`);
        }
  
        results.push(`</tbody></table>`);
        return results.join("\n");
      }
      if(dataType.type === "bitmap")
      {
        const results = [];
        results.push(`<table class="table table-bordered"><tbody>`);
        
        for(const prop of dataType.bitmaps)
        {
          const itemValue = 
            propertiesValue !== null && typeof(propertiesValue) === "object" && prop.name in propertiesValue ? 
              (propertiesValue as any)[prop.name] : undefined;

          results.push(`<tr><td>${prop.name}</td><td>`);
          const subTypeHtml = this.createDeviceInputHtml(prop.value, [...propertyChain, prop.name], itemValue);
          results.push(subTypeHtml);
          results.push(`</td></tr>`);
        }
  
        results.push(`</tbody></table>`);
        return results.join("\n");
      }
      if(dataType.type === "date")
      {
        const dataSize = dataType.size ?? 4;
        const placeholder = dataSize >= 4 ? "yyyy-MM-dd" : dataSize == 3 ? "yyyy-MM" : "yyyy";
        const text = typeof(propertiesValue) === "string" ? propertiesValue : "";
        return `<input type="text" class="form-control" id="${id}" placeholder="${placeholder}" value="${text}" data-type="${dataType.type}" onchange="changeValue('${id}');">`;
      }
      if(dataType.type === "date-time")
      {
        const dataSize = dataType.size ?? 7;
        const placeholder = dataSize >= 7 ? "yyyy-MM-dd HH:mm:ss" : 
          dataSize == 5 ? "yyyy-MM-dd HH:mm:ss" : 
          dataSize == 4 ? "yyyy-MM-dd HH:mm" : 
          dataSize == 3 ? "yyyy-MM-dd HH" : 
          dataSize == 2 ? "yyyy-MM-dd" : 
          dataSize == 1 ? "yyyy-MM" : 
          "yyyy";

        const text = typeof(propertiesValue) === "string" ? propertiesValue : "";
        return `<input type="text" class="form-control" id="${id}" placeholder="${placeholder}" value="${text}" data-type="${dataType.type}" onchange="changeValue('${id}');">`;
      }
      if(dataType.type === "time")
      {
        const dataSize = dataType.size ?? 3;
        const placeholder = dataSize >= 3 ? "HH:mm:ss" : dataSize == 2 ? "HH:mm" : "HH";
        const text = typeof(propertiesValue) === "string" ? propertiesValue : "";
        return `<input type="text" class="form-control" id="${id}" placeholder="${placeholder}" value="${text}" data-type="${dataType.type}" onchange="changeValue('${id}');">`;
      }
      if(dataType.type === "level")
      {
        const text = typeof(propertiesValue) === "number" ? propertiesValue.toString() : "";
        return `<input type="number" class="form-control" id="${id}" placeholder="" value="${text}" data-type="${dataType.type}" onchange="changeValue('${id}');">`;
      }
      if(dataType.type === "number")
      {
        const text = typeof(propertiesValue) === "number" ? propertiesValue.toString() : "";
        return `<input type="number" class="form-control" id="${id}" placeholder="" value="${text}" data-type="${dataType.type}" onchange="changeValue('${id}');">`;
      }
      if(dataType.type === "numericValue")
      {
        const results = [];
        results.push(`<select class="form-select" id="${id}" aria-label="" data-type="${dataType.type}" onchange="changeValue('${id}');">`);
  
        for(const item of dataType.enum)
        {
          const match = item.numericValue === propertiesValue;
          results.push(`<option value="${item.numericValue}" ${match?"selected":""}>${item.numericValue}</option>`);
        }
        results.push(`</select>`);
  
        return results.join("\n");
      }
      if(dataType.type === "object")
      {
        const results = [];
        results.push(`<table class="table table-bordered"><tbody>`);
        
        for(const prop of dataType.properties)
        {
          const itemValue = 
          propertiesValue !== null && typeof(propertiesValue) === "object" && prop.shortName in propertiesValue ? 
            (propertiesValue as any)[prop.shortName] : undefined;

          results.push(`<tr><td>${prop.shortName}</td><td>`);
          const subTypeHtml = this.createDeviceInputHtml(prop.element,  [...propertyChain, prop.shortName], itemValue);
          results.push(subTypeHtml);
          results.push(`</td></tr>`);
        }
  
        results.push(`</tbody></table>`);
        return results.join("\n");
      }
      if(dataType.type === "raw")
      {
        const text = typeof(propertiesValue) === "string" ? propertiesValue : "";
        return `<input type="text" class="form-control" id="${id}" placeholder="" value="${text}" data-type="${dataType.type}" onchange="changeValue('${id}');">`;
      }
      if(dataType.type === "state")
      {
        const results = [];
        results.push(`<select class="form-select" id="${id}" aria-label="" data-type="${dataType.type}" onchange="changeValue('${id}');">`);
  
        for(const item of dataType.enum)
        {
          const match = item.name === propertiesValue;

          results.push(`<option value="${item.name}" ${match?"selected":""}>${item.name}</option>`);
        }
        results.push(`</select>`);
  
        return results.join("\n");
      }
      return "undefined";
    }
    else
    {
      if("oneOf" in dataType)
      {
        const results = [];
        results.push(`<table class="table table-bordered"><tbody>`);
        
        let selectedIndex = 0;
        if( typeof(propertiesValue) === "number" || typeof(propertiesValue)==="string" || typeof(propertiesValue)==="object" )
        {
          if(propertiesValue !== null && propertiesValue !== undefined)
          {
            selectedIndex = ElMixedOneOfType.searchSelectedIndex(dataType, propertiesValue);
          }
        }
      
        for(let i=0; i<dataType.oneOf.length; i++)  //>
        {
          const radioButtonPropertyChain = [...propertyChain, `_select${i}`]
          const radioButtonId = `property-${radioButtonPropertyChain.join("-")}`;
          const subType = dataType.oneOf[i];
          results.push(`<tr><td><input type="radio" id="${radioButtonId}" name="${id}" value="${i}" onchange="changeOneOf('${id}');" ${i === selectedIndex?"checked":""} /></td><td>`);
          const subTypeHtml = this.createDeviceInputHtml(subType, [...propertyChain, `_oneof${i}`], i === selectedIndex ? propertiesValue : undefined);
          results.push(subTypeHtml);
          results.push(`</td></tr>`);
        }
  
        results.push(`</tbody></table>`);
        return results.join("\n");
      }
      else
      {
        return "<div></div>";
      }
    }
  
    return "";
  }



  private toUIData(device: Device):{[key:string]:ViewProperty}
  {
    const result:{[key:string]:ViewProperty} = {};

    for(const prop of device.properties)
    {
      const dataType = prop.schema.data;

      const inputHtml = this.createDeviceInputHtml(dataType, [prop.name], device.propertiesValue[prop.name].value);

      let valueText = "undefined";
      if(device.propertiesValue[prop.name].value !== undefined)
      {
        if(typeof(device.propertiesValue[prop.name].value) === "object")
        {
          valueText =JSON.stringify(device.propertiesValue[prop.name].value);
        }
        else
        {
          valueText = device.propertiesValue[prop.name].value.toString();
        }
      }
      else
      {
        valueText = "undefined";
      }
      result[prop.name] = {
        propertyName:prop.name,
        valueText:valueText,
        inputHtml:inputHtml
      };
  
    }

    return result;
  }


  private getVersions = (
    req: express.Request,
    res: express.Response
  ): void => {
    const result: ApiVersion[] = [
      {
        id:"v1",
        status: "CURRENT",
        updated: "2025-01-05T16:00:00+09:00"
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
    const result = this.deviceStore.getAll().map((_:Device):ApiDeviceSummary=>(
      {
        id: _.id,
        name: _.name,
        deviceType: _.deviceType,
        protocol: _.protocol,
        manufacturer: _.manufacturer,
        eoj: _.eoj,
        ip: _.ip,
        mqttTopics: `${this.mqttBaseTopic}/${_.id}`
      }
    ));
    
    res.json(result);
  }
  
  
  private getDevice = (
    req: express.Request,
    res: express.Response
  ): void => {
    const deviceId = req.params.deviceId;
    const foundDevice = this.deviceStore.getFromNameOrId(deviceId);
    if(foundDevice === undefined){
      res.status(404);
      res.end('device not found : ' + deviceId);
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
      mqttTopics: `${this.mqttBaseTopic}/${foundDevice.id}`,
      propertyValues: Device.ToProperiesObject(foundDevice.propertiesValue),
      values: {}
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
      mqttTopics: `${this.mqttBaseTopic}/${foundDevice.id}/properties/${_.name}`,
      name: _.name
    }));
    for(const propertyName in foundDevice.propertiesValue)
    {
      result.values[propertyName] = {
        name: propertyName,
        value: foundDevice.propertiesValue[propertyName].value,
        updated: foundDevice.propertiesValue[propertyName].updated
      };
    }

    
    res.json(result);
    
  }
  
  private getProperties = (
    req: express.Request,
    res: express.Response
  ): void => {
    const deviceId = req.params.deviceId;
    const foundDevice = this.deviceStore.getFromNameOrId(deviceId);
    if(foundDevice === undefined){
      res.status(404);
      res.end('device not found : ' + deviceId);
      return;
    }
    
    res.json(Device.ToProperiesObject(foundDevice.propertiesValue));
  }
  private getProperty = (
    req: express.Request,
    res: express.Response
  ): void => {
    const deviceId = req.params.deviceId;
    const propertyName = req.params.propertyName;
    const foundDevice = this.deviceStore.getFromNameOrId(deviceId);
    if(foundDevice === undefined){
      res.status(404);
      res.end('device not found : ' + deviceId);
      return;
    }
    if((propertyName in foundDevice.propertiesValue)===false)
    {
      res.status(404);
      res.end('property not found : ' + propertyName);
      return;
    }
    const result: {[key:string]:any} = {
    };
    result[propertyName] = foundDevice.propertiesValue[propertyName].value;
    res.json(result);
  }
  
  private putProperty = async (
    req: express.Request,
    res: express.Response
  ): Promise<void> => {
    const deviceId = req.params.deviceId;
    const propertyName = req.params.propertyName;
    const newValue = req.body[propertyName];
  
    Logger.info("[RESTAPI]", `put property: ${deviceId}\t${propertyName}\t${newValue}`)
  
    const foundDevice = this.deviceStore.getFromNameOrId(deviceId);
    if(foundDevice === undefined){
      res.status(404);
      res.end('device not found : ' + deviceId);
      Logger.warn("[RESTAPI]", 'device not found : ' + deviceId)
      return;
    }
    if((propertyName in foundDevice.propertiesValue)===false)
    {
      res.status(404);
      res.end('property not found : ' + propertyName);
      Logger.warn("[RESTAPI]", 'property not found : ' + propertyName)
      return;
    }
  
    if((propertyName in req.body)===false){
      res.status(404);  //Bad Request
      res.end('Bad Request : ' + JSON.stringify(req.body));
      Logger.warn("[RESTAPI]", 'Bad Request : ' + JSON.stringify(req.body));
      return;
    }
  
    await this.firePropertyChangedRequestEvent(deviceId, propertyName, newValue);
  
    const result:{[key:string]:any} = {};
    result[propertyName] = foundDevice.propertiesValue[propertyName].value;
    res.json(result);
  }

  private requestProperty = async (
    req: express.Request,
    res: express.Response
  ): Promise<void> => {
    const deviceId = req.params.deviceId;
    const propertyName = req.params.propertyName;
  
    Logger.info("[RESTAPI]", `request property: ${deviceId}\t${propertyName}`);
  
    const foundDevice = this.deviceStore.getFromNameOrId(deviceId);
    if(foundDevice === undefined){
      res.status(404);
      res.end('device not found : ' + deviceId);
      Logger.warn("[RESTAPI]", 'device not found : ' + deviceId)
      return;
    }
    if((propertyName in foundDevice.propertiesValue)===false)
    {
      res.status(404);
      res.end('property not found : ' + propertyName);
      Logger.warn("[RESTAPI]", 'property not found : ' + propertyName)
      return;
    }
  
    await this.firePropertyRequestedRequestEvent(deviceId, propertyName);
  
    res.json({});
  }

  private requestProperties = async (
    req: express.Request,
    res: express.Response
  ): Promise<void> => {
    const deviceId = req.params.deviceId;
    const body = req.body as {[key:string]:any};

    Logger.info("[RESTAPI]", `request properties: ${deviceId}\t${JSON.stringify(body)}`);

    const foundDevice = this.deviceStore.getFromNameOrId(deviceId);
    if(foundDevice === undefined){
      res.status(404);
      res.end('device not found : ' + deviceId);
      Logger.warn("[RESTAPI]", 'device not found : ' + deviceId)
      return;
    }

    for(const propertyName in body)
    {
      if((propertyName in foundDevice.propertiesValue)===false)
      {
        Logger.warn("[RESTAPI]", 'property not found : ' + propertyName)
        continue;
      }
      await this.firePropertyRequestedRequestEvent(deviceId, propertyName);
    }
  
    res.json({});
  }

  private getStatus = (
    req: express.Request,
    res: express.Response
  ): void => {
    const result:ServerStatus = {
      mqttState: this.systemStatusRepository.SystemStatus.mqttState,
      systemVersion: process.env.npm_package_version ?? "",
      devices:[]
    };
    result.devices = this.deviceStore.getAll().map((_):ApiDeviceSummary=>(
      {
        id: _.id,
        eoj: _.eoj,
        ip: _.ip,
        name: _.name,
        deviceType: _.deviceType,
        manufacturer: _.manufacturer,
        mqttTopics: `${this.mqttBaseTopic}/${_.id}`,
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

  private downloadLogs = async (
    req: express.Request,
    res: express.Response
  ): Promise<void> => {

    
    
    const zip = new admZip();
    
    zip.addFile("alldevices.json",Buffer.from(JSON.stringify(this.deviceStore.getAll(), null, 2)));
    zip.addFile("logs.json", Buffer.from(JSON.stringify(this.logRepository.logs, null, 2)))
    zip.addFile("ELRawData.json", Buffer.from(JSON.stringify(this.echoNetLiteController.getRawData(), null, 2)))
    zip.addFile("echoNetLiteController.json", Buffer.from(JSON.stringify(this.echoNetLiteController.getInternalStatus(), null, 2)))
    for(const detailLog of this.detailLogsCallback())
    {
      zip.addFile(detailLog.fileName, Buffer.from(detailLog.content));
    }
    zip.addLocalFolder(path.resolve(__dirname, "..", "logs"), "logs");

    const buffer = await zip.toBufferPromise();
    
    const fileName = "echonetlite2mqtt_logs_internalsStatus.zip";
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment;filename=${fileName}`);
    res.send(buffer);
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
      //Logger.write(`new EVENT:${lastEventId} !== ${this.eventRepository.lastId}`)
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
      //Logger.write(`no  EVENT:${_.lastEventId}`)
    });
    this.waitingResponseList = [];
  }

  private timeoutLongPolling = ():void =>{
    this.waitingResponseList.forEach(_=>{
      const newEvents = this.eventRepository.getNewEvents(_.lastEventId);
      _.res.json(newEvents);
      _.res.end();
      //Logger.write(`no  EVENT:${_.lastEventId}`)
    });
    this.waitingResponseList = [];
  }

  private getServerEvents = (
    req: express.Request,
    res: express.Response
  ): void => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const eventReceiverId = crypto.randomUUID();
    this.eventRepository.addEventCallback(eventReceiverId, 
      async (eventName:string, deviceId:string):Promise<void>=>{
        try
        {
          res.write(`event: ${eventName}\n`);
          res.write(`data: ${JSON.stringify({event:eventName, id:deviceId})}\n\n`);
        }
        catch(e)
        {
          this.eventRepository.removeEventCallback(eventReceiverId);
        }
    });

    // クライアントが接続を閉じた場合
    req.on('close', () => {
      this.eventRepository.removeEventCallback(eventReceiverId);
    });
  }

  private getOpenApiJson = (
    req: express.Request,
    res: express.Response
  ): void => {
    res.send(this.createOpenApiJson);
  }

  private createOpenApiJson = (
  ) => {
    var converter = new RestApiOpenApiConverter();
    const jsonObj = converter.createOpenApiJson(this.deviceStore);
    return jsonObj;
  }
}

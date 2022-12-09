import { AliasOption, Device, DeviceId } from "./Property";
import { MqttController } from "./MqttController";
import { DeviceStore } from "./DeviceStore";
import { EchoNetLiteController } from "./EchoNetLiteController";
import { RestApiController } from "./RestApiController";
import fs from "fs";
import mqtt from "mqtt";
import { SystemStatusRepositry } from "./ApiTypes";
import { EventRepository } from "./EventRepository";
import { LogRepository } from "./LogRepository";

let echonetTargetNetwork = "";
let echonetIntervalToGetProperties = 100;
let echonetAliasFile="";
let debugLog = false;
let restApiPort = 3000;
let restApiHost = "0.0.0.0";
let mqttBroker = "";
let mqttOptionFile = "";
let mqttBaseTopic = "echonetlite2mqtt/elapi/v2/devices";
let mqttCaFile = "";
let mqttCertFile = "";
let mqttKeyFile = "";

if (
  "ECHONET_TARGET_NETWORK" in process.env &&
  process.env.ECHONET_TARGET_NETWORK !== undefined
) {
  echonetTargetNetwork = process.env.ECHONET_TARGET_NETWORK.replace(/^"/g, "").replace(/"$/g, "");
}
if (
  "ECHONET_INTERVAL_TO_GET_PROPERTIES" in process.env &&
  process.env.ECHONET_INTERVAL_TO_GET_PROPERTIES !== undefined
) {
  const tempText = process.env.ECHONET_INTERVAL_TO_GET_PROPERTIES.replace(/^"/g, "").replace(/"$/g, "");
  const tempNo = Number(tempText);
  if(isNaN(tempNo) === false)
  {
    echonetIntervalToGetProperties = tempNo;
  }
}
if (
  "ECHONET_ALIAS_FILE" in process.env &&
  process.env.ECHONET_ALIAS_FILE !== undefined
) {
  echonetAliasFile = process.env.ECHONET_ALIAS_FILE.replace(/^"/g, "").replace(/"$/g, "");
}
if ("DEBUG" in process.env && process.env.DEBUG !== undefined) {
  debugLog =
    process.env.DEBUG.toUpperCase() === "TRUE" || process.env.DEBUG === "1" || 
    process.env.DEBUG.toUpperCase() === "\"TRUE\"" || process.env.DEBUG === "\"1\"";
}

if("REST_API_PORT" in process.env && process.env.REST_API_PORT !== undefined)
{
  const tempNo = Number(process.env.REST_API_PORT.replace(/^"/g, "").replace(/"$/g, ""));
  if(isNaN(tempNo)===false)
  {
    restApiPort = tempNo;
  }
}
if("REST_API_HOST" in process.env && process.env.REST_API_HOST !== undefined)
{
  restApiHost = process.env.REST_API_HOST.replace(/^"/g, "").replace(/"$/g, "");
}
if("MQTT_BROKER" in process.env && process.env.MQTT_BROKER !== undefined)
{
  mqttBroker = process.env.MQTT_BROKER.replace(/^"/g, "").replace(/"$/g, "");
}
if("MQTT_OPTION_FILE" in process.env && process.env.MQTT_OPTION_FILE !== undefined)
{
  mqttOptionFile = process.env.MQTT_OPTION_FILE.replace(/^"/g, "").replace(/"$/g, "");
}
if("MQTT_BASE_TOPIC" in process.env && process.env.MQTT_BASE_TOPIC !== undefined)
{
  mqttBaseTopic = process.env.MQTT_BASE_TOPIC.replace(/^"/g, "").replace(/"$/g, "");
}
if("MQTT_CA_FILE" in process.env && process.env.MQTT_CA_FILE !== undefined)
{
  mqttCaFile = process.env.MQTT_CA_FILE.replace(/^"/g, "").replace(/"$/g, "");
}
if("MQTT_CERT_FILE" in process.env && process.env.MQTT_CERT_FILE !== undefined)
{
  mqttCertFile = process.env.MQTT_CERT_FILE.replace(/^"/g, "").replace(/"$/g, "");
}
if("MQTT_KEY_FILE" in process.env && process.env.MQTT_KEY_FILE !== undefined)
{
  mqttKeyFile = process.env.MQTT_KEY_FILE.replace(/^"/g, "").replace(/"$/g, "");
}

for(var i = 2;i < process.argv.length; i++){
  const name = process.argv[i].toLowerCase();
  const value = i + 1 < process.argv.length ? process.argv[i+1] : "";

  if(name === "--debug".toLowerCase())
  {
    debugLog = true;
  }

  if(value === "")
  {
    continue;
  }

  if(name === "--echonetTargetNetwork".toLowerCase())
  {
    echonetTargetNetwork = value.replace(/^"/g, "").replace(/"$/g, "");
  }
  if(name === "--echonetAliasFile".toLowerCase())
  {
    echonetAliasFile = value.replace(/^"/g, "").replace(/"$/g, "");
  }
  if(name === "--echonetIntervalToGetProperties".toLowerCase())
  {
    const tempText = value.replace(/^"/g, "").replace(/"$/g, "");
    const tempNo = Number(tempText);
    if(isNaN(tempNo) === false)
    {
      echonetIntervalToGetProperties = tempNo;
    }
  }
  if(name === "--RestApiPort".toLowerCase())
  {
    const tempNo = Number(value.replace(/^"/g, "").replace(/"$/g, ""));
    if(isNaN(tempNo)===false)
    {
      restApiPort = tempNo;
    }
  }
  if(name === "--RestApiHost".toLowerCase())
  {
    restApiHost = value.replace(/^"/g, "").replace(/"$/g, "");
  }
  if(name === "--MqttBroker".toLowerCase())
  {
    mqttBroker = value.replace(/^"/g, "").replace(/"$/g, "");
  }
  if(name === "--MqttOptionFile".toLowerCase())
  {
    mqttOptionFile = value.replace(/^"/g, "").replace(/"$/g, "");
  }
  if(name === "--MqttBaseTopic".toLowerCase())
  {
    mqttBaseTopic = value.replace(/^"/g, "").replace(/"$/g, "");
  }
  if(name === "--MqttCaFile".toLowerCase())
  {
    mqttCaFile = value.replace(/^"/g, "").replace(/"$/g, "");
  }
  if(name === "--MqttCertFile".toLowerCase())
  {
    mqttCertFile = value.replace(/^"/g, "").replace(/"$/g, "");
  }
  if(name === "--MqttKeyFile".toLowerCase())
  {
    mqttKeyFile = value.replace(/^"/g, "").replace(/"$/g, "");
  }
}



const logger = new LogRepository();


console.log(`${process.env.npm_package_name} ver.${process.env.npm_package_version}`);
console.log("");

logger.output(`echonetTargetNetwork=${echonetTargetNetwork}`);
logger.output(`echonetAliasFile=${echonetAliasFile}`);
logger.output(`echonetIntervalToGetProperties=${echonetIntervalToGetProperties}`);
logger.output(`debugLog=${debugLog}`);
logger.output(`restApiPort=${restApiPort}`);
logger.output(`restApiHost=${restApiHost}`);
logger.output(`mqttBroker=${mqttBroker}`);
logger.output(`mqttOptionFile=${mqttOptionFile}`);
logger.output(`mqttBaseTopic=${mqttBaseTopic}`);
logger.output(`mqttCaFile=${mqttCaFile}`);
logger.output(`mqttCertFile=${mqttCertFile}`);
logger.output(`mqttKeyFile=${mqttKeyFile}`);
logger.output(``);


let mqttOption:mqtt.IClientOptions = {
  port:1883
};

if(mqttOptionFile !== "" && fs.existsSync(mqttOptionFile))
{
  const mqttOptionText = fs.readFileSync(mqttOptionFile, {encoding: "utf-8"});
  mqttOption = JSON.parse(mqttOptionText) as mqtt.IClientOptions;
}

if(mqttCaFile !== "" && fs.existsSync(mqttCaFile))
{
  mqttOption.ca = fs.readFileSync(mqttCaFile, {encoding:"utf-8"});
  logger.output(`load ${mqttCaFile}`)
}
if(mqttCertFile !== "" && fs.existsSync(mqttCertFile))
{
  mqttOption.cert = fs.readFileSync(mqttCertFile, {encoding:"utf-8"});
  logger.output(`load ${mqttCertFile}`)
}
if(mqttKeyFile !== "" && fs.existsSync(mqttKeyFile))
{
  mqttOption.key = fs.readFileSync(mqttKeyFile, {encoding:"utf-8"});
  logger.output(`load ${mqttKeyFile}`)
}

const aliasOption: AliasOption = AliasOption.empty;

if(echonetAliasFile!=="")
{
  if(fs.existsSync(echonetAliasFile)===false)
  {
    logger.output(`[ERROR] echonetAliasFile is not found. : ${echonetAliasFile}`);
  }
  else
  {
    const aliasContent = fs.readFileSync(echonetAliasFile, {encoding:"utf8"});
    let aliasOptionTemp:AliasOption|undefined = undefined;
    try
    {
      aliasOptionTemp = JSON.parse(aliasContent) as AliasOption;
    }
    catch(e)
    {
      logger.output(`[ERROR] echonetAliasFile is not a json file. : ${echonetAliasFile}`);
    }
    if(aliasOptionTemp !== undefined)
    {
      if(AliasOption.validate(aliasOptionTemp) === false)
      {
        logger.output(`[ERROR] echonetAliasFile is unexpected format. : ${echonetAliasFile}`);
      }
      else
      {
        aliasOption.aliases = aliasOptionTemp.aliases;
      }
    }
  }
}

logger.output("");

const eventRepository = new EventRepository();

const systemStatusRepository = new SystemStatusRepositry();

const deviceStore = new DeviceStore();

const echoNetListController = new EchoNetLiteController(echonetTargetNetwork, echonetIntervalToGetProperties, aliasOption);

echoNetListController.addDeviceDetectedEvent(()=>{
  const deviceIds = echoNetListController.getDetectedDeviceIds();
  for(const deviceId of deviceIds)
  {
    if(deviceStore.exists(deviceId.id)===false)
    {
      const device = echoNetListController.getDevice(deviceId);
      if(device!==undefined)
      {
        const deviceNameText = (device.name + "                                  ").slice(0, 34);
        logger.output(`[ECHONETLite] new device:   ${deviceNameText} ${device.deviceType} ${device.ip} ${device.eoj}`);
        //console.dir(device, {depth:10});
        deviceStore.add(device);
        mqttController.publishDevices();
        mqttController.publishDevice(device.id);
        mqttController.publishDevicePropertiesAndAllProperty(device.id);
        eventRepository.newEvent(`${device.id}`);
        eventRepository.newEvent(`SYSTEM`);
        eventRepository.newEvent(`LOG`);
        restApiController.setNewEvent();
      }
    }
  }
});

echoNetListController.addPropertyChnagedEvent((id:DeviceId, propertyName:string, newValue:any):void =>{
  
  const device = deviceStore.get(id.id);
  if(device===undefined)
  {
    return;
  }
  const oldValue = deviceStore.getProperty(id.id, propertyName);

  deviceStore.changeProperty(id.id, propertyName, newValue);
  mqttController.publishDeviceProperties(id.id);
  mqttController.publishDeviceProperty(id.id, propertyName);
  eventRepository.newEvent(`${id.id}`);
  if(JSON.stringify(oldValue) !== JSON.stringify(newValue))
  {
    const deviceNameText = (device.name + "                                  ").slice(0, 34);
    const valueText = typeof(newValue) === "object" ? JSON.stringify(newValue) : newValue.toString();
    logger.output(`[ECHONETLite] prop changed: ${deviceNameText} ${propertyName} ${valueText}`);
    eventRepository.newEvent(`LOG`);
    restApiController.setNewEvent();
  }
});

const restApiController = new RestApiController(deviceStore, systemStatusRepository, eventRepository, logger, restApiHost, restApiPort, mqttBaseTopic);
restApiController.addPropertyChangedRequestEvent((deviceId:string, propertyName:string, newValue:any):void=>{

  const device = deviceStore.getFromNameOrId(deviceId);
  if(device === undefined){
    return;
  }
  const deviceNameText = (device.name + "                                  ").slice(0, 34);
  const valueText = typeof(newValue) === "object" ? JSON.stringify(newValue) : newValue.toString();
  logger.output(`[RESTAPI]     prop changed: ${deviceNameText} ${propertyName} ${valueText}`);
  eventRepository.newEvent(`LOG`);

  echoNetListController.setDeviceProperty({id: deviceId, ip: device.ip, eoj:device.eoj}, propertyName, newValue);
});
restApiController.addPropertyRequestedRequestEvent((deviceId:string, propertyName:string):void=>{
  const device = deviceStore.getFromNameOrId(deviceId);
  if(device === undefined){
    logger.output('[RESTAPI] device not found : ' + deviceId)
    return;
  }
  if((propertyName in device.propertiesValue)===false)
  {
    logger.output('[RESTAPI] property not found : ' + propertyName)
    return;
  }

  const deviceNameText = (device.name + "                                  ").slice(0, 34);
  logger.output(`[RESTAPI]     prop reuqest: ${deviceNameText} ${propertyName}`);
  eventRepository.newEvent(`LOG`);

  echoNetListController.requestDeviceProperty({id: deviceId, ip: device.ip, eoj:device.eoj}, propertyName);
});

const mqttController = new MqttController(deviceStore, mqttBroker, mqttOption, mqttBaseTopic);
mqttController.addPropertyChnagedEvent((deviceId:string, propertyName:string, value:any):void=>{
  const device = deviceStore.getFromNameOrId(deviceId);
  if(device === undefined){
    logger.output('[MQTT] device not found : ' + deviceId)
    return;
  }
  if((propertyName in device.propertiesValue)===false)
  {
    logger.output('[MQTT] property not found : ' + propertyName)
    return;
  }

  const deviceNameText = (device.name + "                                  ").slice(0, 34);
  const valueText = typeof(value) === "object" ? JSON.stringify(value) : value.toString();
  logger.output(`[MQTT]        prop changed: ${deviceNameText} ${propertyName} ${valueText}`);
  eventRepository.newEvent(`LOG`);

  echoNetListController.setDeviceProperty({id: deviceId, ip: device.ip, eoj:device.eoj}, propertyName, value);
});
mqttController.addPropertyRequestedEvent((deviceId:string, propertyName:string):void=>{
  const device = deviceStore.getFromNameOrId(deviceId);
  if(device === undefined){
    logger.output('[MQTT] device not found : ' + deviceId)
    return;
  }
  if((propertyName in device.propertiesValue)===false)
  {
    logger.output('[MQTT] property not found : ' + propertyName)
    return;
  }

  const deviceNameText = (device.name + "                                  ").slice(0, 34);
  logger.output(`[MQTT]        prop reuqest: ${deviceNameText} ${propertyName}`);
  eventRepository.newEvent(`LOG`);

  echoNetListController.requestDeviceProperty({id: deviceId, ip: device.ip, eoj:device.eoj}, propertyName);
});


mqttController.addConnectionStateChangedEvent(():void=>{
  systemStatusRepository.SystemStatus.mqttState = mqttController.ConnectionState;
  logger.output(`[MQTT] ${mqttController.ConnectionState}`);
  eventRepository.newEvent(`SYSTEM`);
  eventRepository.newEvent(`LOG`);
  restApiController.setNewEvent();
});


echoNetListController.start();
restApiController.start();
mqttController.start();
if(mqttBroker === "")
{
  logger.output(`[MQTT] mqttBroker is not configured.`);
}


import { AliasOption, Device, DeviceId } from "./Property";
import { HoldOption, MqttController } from "./MqttController";
import { DeviceStore } from "./DeviceStore";
import { EchoNetLiteController } from "./EchoNetLiteController";
import { RestApiController } from "./RestApiController";
import fs from "fs";
import mqtt from "mqtt";
import { SystemStatusRepositry } from "./ApiTypes";
import { EventRepository } from "./EventRepository";
import { LogRepository } from "./LogRepository";
import { Logger } from "./Logger";
import path from "path";
import os from "os";
import ip from "ip";

interface InputParameters{
  echonetTargetNetwork:string;
  echonetAliasFile:string;
  echonetLegacyMultiNicMode:boolean;
  echonetUnknownAsError:boolean;
  echonetDeviceIpList:string;
  echonetDisableAutoDeviceDiscovery:boolean;
  echonetCommandTimeout:number;
  debugLog:boolean;
  restApiPort:number;
  restApiHost:string;
  restApiRoot:string;
  mqttBroker:string;
  mqttOptionFile:string;
  mqttBaseTopic:string;
  mqttCaFile:string;
  mqttCertFile:string;
  mqttKeyFile:string;
  version:string;
  buildInfo:string;
};

let echonetTargetNetwork = "";
let echonetAliasFile="";
let echonetLegacyMultiNicMode = false;
let echonetUnknownAsError = false;
let echonetDeviceIpList = "";
let echonetDisableAutoDeviceDiscovery = false;
let echonetCommandTimeout = 3000;
let debugLog = false;
let restApiPort = 3000;
let restApiHost = "0.0.0.0";
let restApiRoot = "";
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
  "ECHONET_ALIAS_FILE" in process.env &&
  process.env.ECHONET_ALIAS_FILE !== undefined
) {
  echonetAliasFile = process.env.ECHONET_ALIAS_FILE.replace(/^"/g, "").replace(/"$/g, "");
}

if( "ECHONET_LEGACY_MULTI_NIC_MODE" in process.env && process.env.ECHONET_LEGACY_MULTI_NIC_MODE !== undefined)
{
  if(process.env.ECHONET_LEGACY_MULTI_NIC_MODE !== "0" && 
    process.env.ECHONET_LEGACY_MULTI_NIC_MODE !== "false" && 
    process.env.ECHONET_LEGACY_MULTI_NIC_MODE !== "\"0\"" && 
    process.env.ECHONET_LEGACY_MULTI_NIC_MODE !== "\"false\"")
  {
    echonetLegacyMultiNicMode = true;
  }
}

if( "ECHONET_UNKNOWN_AS_ERROR" in process.env && process.env.ECHONET_UNKNOWN_AS_ERROR !== undefined)
{
  if(process.env.ECHONET_UNKNOWN_AS_ERROR !== "0" && 
    process.env.ECHONET_UNKNOWN_AS_ERROR !== "false" && 
    process.env.ECHONET_UNKNOWN_AS_ERROR !== "\"0\"" && 
    process.env.ECHONET_UNKNOWN_AS_ERROR !== "\"false\"")
  {
    echonetUnknownAsError = true;
  }
}

if ("ECHONET_DEVICE_IP_LIST" in process.env &&
  process.env.ECHONET_DEVICE_IP_LIST !== undefined
) {
  echonetDeviceIpList = process.env.ECHONET_DEVICE_IP_LIST.replace(/^"/g, "").replace(/"$/g, "");
}

if( "ECHONET_DISABLE_AUTO_DEVICE_DISCOVERY" in process.env && 
  process.env.ECHONET_DISABLE_AUTO_DEVICE_DISCOVERY !== undefined)
{
  if(process.env.ECHONET_DISABLE_AUTO_DEVICE_DISCOVERY !== "0" && 
    process.env.ECHONET_DISABLE_AUTO_DEVICE_DISCOVERY !== "false" && 
    process.env.ECHONET_DISABLE_AUTO_DEVICE_DISCOVERY !== "\"0\"" && 
    process.env.ECHONET_DISABLE_AUTO_DEVICE_DISCOVERY !== "\"false\"")
  {
    echonetDisableAutoDeviceDiscovery = true;
  }
}

if( "ECHONET_COMMAND_TIMEOUT" in process.env && 
  process.env.ECHONET_COMMAND_TIMEOUT !== undefined)
{
  const temp = process.env.ECHONET_COMMAND_TIMEOUT.replace(/^"/g, "").replace(/"$/g, "");
  const tempNo = Number(temp);
  if(isNaN(tempNo)===false)
  {
    echonetCommandTimeout = tempNo;
  }
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
if("REST_API_ROOT" in process.env && process.env.REST_API_ROOT !== undefined)
{
  restApiRoot = process.env.REST_API_ROOT.replace(/^"/g, "").replace(/"$/g, "");
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

if("ECHONET_INTERVAL_TO_GET_PROPERTIES" in process.env && process.env.ECHONET_INTERVAL_TO_GET_PROPERTIES !== undefined)
{
  Logger.warn("", `The ECHONET_ALT_MULTI_NIC_MODE option has been deprecated. This option is ignored.`);
}
if("ECHONET_ALT_MULTI_NIC_MODE" in process.env && process.env.ECHONET_ALT_MULTI_NIC_MODE !== undefined)
{
  Logger.warn("", `The ECHONET_ALT_MULTI_NIC_MODE option has been deprecated. This option is ignored.`);
}



for(var i = 2;i < process.argv.length; i++){
  const name = process.argv[i].toLowerCase();
  const value = i + 1 < process.argv.length ? process.argv[i+1] : "";

  if(name === "--debug".toLowerCase())
  {
    debugLog = true;
  }

  if(name === "--echonetTargetNetwork".toLowerCase())
  {
    echonetTargetNetwork = value.replace(/^"/g, "").replace(/"$/g, "");
  }
  if(name === "--echonetAliasFile".toLowerCase())
  {
    echonetAliasFile = value.replace(/^"/g, "").replace(/"$/g, "");
  }
  if(name === "--echonetLegacyMultiNicMode".toLowerCase())
  {
    if(value !== "0" && value !== "false" && value !== "\"0\"" && value !== "\"false\"")
    {
      echonetLegacyMultiNicMode = true;
    }
  }
  if(name === "--echonetUnknownAsError".toLowerCase())
  {
    if(value !== "0" && value !== "false" && value !== "\"0\"" && value !== "\"false\"")
    {
      echonetUnknownAsError = true;
    }
  }
  if(name === "--echonetDeviceIpList".toLowerCase())
  {
    echonetDeviceIpList = value.replace(/^"/g, "").replace(/"$/g, "");
  }
  if(name === "--echonetDisableAutoDeviceDiscovery".toLowerCase())
  {
    if(value !== "0" && value !== "false" && value !== "\"0\"" && value !== "\"false\"")
    {
      echonetDisableAutoDeviceDiscovery = true;
    }
  }
  if(name === "--echonetCommandTimeout".toLowerCase())
  {
    const tempNo = Number(value.replace(/^"/g, "").replace(/"$/g, ""));
    if(value!=="" && isNaN(tempNo)===false)
    {
      echonetCommandTimeout = tempNo;
    }
  }
  if(name === "--RestApiPort".toLowerCase())
  {
    const tempNo = Number(value.replace(/^"/g, "").replace(/"$/g, ""));
    if(value!=="" && isNaN(tempNo)===false)
    {
      restApiPort = tempNo;
    }
  }
  if(name === "--RestApiHost".toLowerCase())
  {
    if(value!=="")
    {
      restApiHost = value.replace(/^"/g, "").replace(/"$/g, "");
    }
  }
  if(name === "--RestApiRoot".toLowerCase())
  {
    if(value!=="")
    {
      restApiRoot = value.replace(/^"/g, "").replace(/"$/g, "");
    }
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

  if(name === "--echonetIntervalToGetProperties".toLowerCase())
  {
    Logger.warn("", `The echonetIntervalToGetProperties option has been deprecated. This option is ignored.`);
  }
  if(name === "--echonetAltMultiNicMode".toLowerCase())
  {
    Logger.warn("", `The echonetAltMultiNicMode option has been deprecated. This option is ignored.`);
  }
}


const logger = new LogRepository();


Logger.info("", `${process.env.npm_package_name} ver.${process.env.npm_package_version}`);

let buildInfo="";
if(fs.existsSync(path.resolve(__dirname, "../buildinfo")))
{
  buildInfo = fs.readFileSync(path.resolve(__dirname, "../buildinfo"), {encoding:"utf-8"});
  Logger.info("", buildInfo);
}


Logger.info("", "");

logger.output(`echonetTargetNetwork=${echonetTargetNetwork}`);
logger.output(`echonetAliasFile=${echonetAliasFile}`);
logger.output(`echonetLegacyMultiNicMode=${echonetLegacyMultiNicMode}`);
logger.output(`echonetUnknownAsError=${echonetUnknownAsError}`);
logger.output(`echonetDeviceIpList=${echonetDeviceIpList}`);
logger.output(`echonetDisableAutoDeviceDiscovery=${echonetDisableAutoDeviceDiscovery}`);
logger.output(`echonetCommandTimeout=${echonetCommandTimeout}`);
logger.output(`debugLog=${debugLog}`);
logger.output(`restApiPort=${restApiPort}`);
logger.output(`restApiHost=${restApiHost}`);
logger.output(`restApiRoot=${restApiRoot}`);
logger.output(`mqttBroker=${mqttBroker}`);
logger.output(`mqttOptionFile=${mqttOptionFile}`);
logger.output(`mqttBaseTopic=${mqttBaseTopic}`);
logger.output(`mqttCaFile=${mqttCaFile}`);
logger.output(`mqttCertFile=${mqttCertFile}`);
logger.output(`mqttKeyFile=${mqttKeyFile}`);
logger.output(``);

const inputParameters:InputParameters =
{
  echonetTargetNetwork,
  echonetAliasFile,
  echonetLegacyMultiNicMode,
  echonetUnknownAsError,
  echonetDeviceIpList,
  echonetDisableAutoDeviceDiscovery,
  echonetCommandTimeout,
  debugLog,
  restApiPort,
  restApiHost,
  restApiRoot,
  mqttBroker,
  mqttOptionFile,
  mqttBaseTopic,
  mqttCaFile,
  mqttCertFile,
  mqttKeyFile,
  version:`${process.env.npm_package_name} ver.${process.env.npm_package_version}`,
  buildInfo:buildInfo
};


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
      const validationResult = AliasOption.validate(aliasOptionTemp);
      if(validationResult.valid === false)
      {
        
        logger.output(`[ERROR] echonetAliasFile is unexpected format. : ${echonetAliasFile}
error details:
${validationResult.message}`);
      }
      else
      {
        aliasOption.aliases = aliasOptionTemp.aliases;
      }
    }
  }
}

// echonetTargetNetworkが xxx.xxx.xxx.xxx/yy の形式かチェックする
if(echonetTargetNetwork !== "" && echonetTargetNetwork.match(/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+\/[0-9]+/)===null )
{
  Logger.error("", `echonetTargetNetwork is invalid format. expected "xxx.xxx.xxx.xxx/yy". : "${echonetTargetNetwork}"`)
  echonetTargetNetwork = "";
}

// echonetDeviceIpListが カンマ区切りのIPv4形式かチェックする
let knownDeviceIpList:string[] = [];
if(echonetDeviceIpList !== "")
{
  for(let ip of echonetDeviceIpList.split(","))
  {
    ip = ip.trim();
    if(ip.match(/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/) === null)
    {
      Logger.warn("", `echonetDeviceIpList is invalid format. expected  "xxx.xxx.xxx.xxx" separated by commas. : "${ip}"`)
    }
    else
    {
      knownDeviceIpList.push(ip);
    }
  }
}

// echonetDeviceIpListが渡されているなら、OSにあるネットワークインターフェースのネットワーク範囲に入っているかチェックする
if(knownDeviceIpList.length > 0)
{
  let notMatchedDeviceIpList = [...knownDeviceIpList];

  const networkInterfaces = os.networkInterfaces();
  for (const interfaceName of Object.keys(networkInterfaces)) {
    const interfaces = networkInterfaces[interfaceName];
    if(interfaces === undefined)
    {
      continue;
    }
  
    for(const interfaceInfo of interfaces.filter(_=>_.family === "IPv4"))
    {
      const subnet = ip.subnet(interfaceInfo.address, interfaceInfo.netmask);
      notMatchedDeviceIpList = notMatchedDeviceIpList.filter(deviceIp=>subnet.contains(deviceIp)===false);
    }
  }

  if(notMatchedDeviceIpList.length > 0)
  {
    for(const deviceIp of notMatchedDeviceIpList)
    {
      Logger.warn("", `"${deviceIp}" is not in the network range of the host.`);
    }
    knownDeviceIpList = knownDeviceIpList.filter(_=>notMatchedDeviceIpList.includes(_)==false);
  }
}

let networkInterfaceForEchonet:os.NetworkInterfaceInfo|undefined = undefined;
// echonetTargetNetworkが指定されていたら、合致するネットワークインターフェイスを探して、それを使用する。
if (echonetTargetNetwork !== "") {

  const interfaces = os.networkInterfaces();
  const matchedNetworkAddresses = Object.keys(interfaces)
    .map((key) => interfaces[key])
    .flat()
    .filter((_) => _!==undefined && ip.cidrSubnet(echonetTargetNetwork).contains(_.address));
  
  if(matchedNetworkAddresses.length > 0 && matchedNetworkAddresses[0] !== undefined)
  {
    networkInterfaceForEchonet = matchedNetworkAddresses[0];
    Logger.info("", `use the network "${networkInterfaceForEchonet.address}" for echonet lite.`);
  }
  else
  {
    Logger.warn("", `the network "${echonetTargetNetwork}" is not found in the host.`);
  }
}

// echonetTargetNetworkが指定されておらず、echonetDeviceIpListが渡されていたら、
// echonetDeviceIpListの最初のIPアドレスが属するネットワークを使用する。
if(networkInterfaceForEchonet === undefined && knownDeviceIpList.length > 0)
{
  const deviceIp = knownDeviceIpList[0];

  const networkInterfaces = os.networkInterfaces();
  for (const interfaceName of Object.keys(networkInterfaces)) {
    const interfaces = networkInterfaces[interfaceName];
    if(interfaces === undefined)
    {
      continue;
    }
  
    const matchedInterfaces = interfaces.filter(_=>_.family === "IPv4").filter(interfaceInfo=>{
      const subnet = ip.subnet(interfaceInfo.address, interfaceInfo.netmask);
      if (subnet.contains(deviceIp)) {
        return true;
      }
      return false;
    });
    if(matchedInterfaces.length > 0)
    {
      networkInterfaceForEchonet = matchedInterfaces[0];
      Logger.info("", `use the network "${networkInterfaceForEchonet.address}" for echonet lite.`);
      break;
    }
  }
}

if(networkInterfaceForEchonet !== undefined)
{
  // 決めたネットワークに含まれないデバイスIPは削除する
  const subnet = ip.subnet(networkInterfaceForEchonet.address, networkInterfaceForEchonet.netmask);
  for(const deviceIp of knownDeviceIpList)
  {
    if(subnet.contains(deviceIp) === false)
    {
      Logger.warn("", `"${deviceIp}" is not in the network range of the network ${networkInterfaceForEchonet.address}.`);
    }
  }

  knownDeviceIpList = knownDeviceIpList.filter(deviceIp=>subnet.contains(deviceIp));
}

const networkAddressForEchonet = networkInterfaceForEchonet !== undefined ? networkInterfaceForEchonet.address : "";

logger.output("");

const eventRepository = new EventRepository();

const systemStatusRepository = new SystemStatusRepositry();

const deviceStore = new DeviceStore();

const echoNetListController = new EchoNetLiteController(networkAddressForEchonet, 
  aliasOption, echonetLegacyMultiNicMode, echonetUnknownAsError, 
  knownDeviceIpList, echonetDisableAutoDeviceDiscovery===false, echonetCommandTimeout,
  (internalId:string)=>deviceStore.getByInternalId(internalId));

echoNetListController.addDeviceDetectedEvent((device:Device)=>{
  if(device === undefined)
  {
    return;
  }
  if(deviceStore.exists(device.internalId))
  {
    return;
  }
  
  const deviceNameText = device.name.padEnd(41, " ");
  logger.output(`[ECHONETLite] new device:   ${deviceNameText} ${device.deviceType} ${device.ip} ${device.eoj}`);
  deviceStore.add(device);
  mqttController.publishDevices();
  mqttController.publishDevice(device.id);
  mqttController.publishDevicePropertiesAndAllProperty(device.id);
  eventRepository.newEvent(`${device.id}`);
  eventRepository.newEvent(`SYSTEM`);
  eventRepository.newEvent(`LOG`);
  restApiController.setNewEvent();
});
echoNetListController.addDeviceUpdatedEvent((currentDevice:Device, newDevice:Device)=>{

  const deviceNameText = newDevice.name.padEnd(41, " ");
  logger.output(`[ECHONETLite] update device id:${deviceNameText} ${newDevice.deviceType} ${newDevice.ip} ${newDevice.eoj}`);
  deviceStore.del(currentDevice.internalId)
  deviceStore.add(newDevice);
  mqttController.publishDevices();
  mqttController.publishDevice(newDevice.id);
  mqttController.publishDevicePropertiesAndAllProperty(newDevice.id);
  eventRepository.newEvent(`${newDevice.id}`);
  eventRepository.newEvent(`SYSTEM`);
  eventRepository.newEvent(`LOG`);
  restApiController.setNewEvent();
});

echoNetListController.addPropertyChnagedEvent((ip:string, eoj:string, propertyName:string, newValue:any):void =>{
  
  if(newValue === undefined)
  {
    return;
  }
  const device = deviceStore.getByIpEoj(ip, eoj);
  if(device===undefined)
  {
    return;
  }
  const oldValue = deviceStore.getProperty(device.id, propertyName);

  deviceStore.changeProperty(device.id, propertyName, newValue);
  mqttController.publishDeviceProperties(device.id);
  mqttController.publishDeviceProperty(device.id, propertyName);
  eventRepository.newEvent(`${device.id}`);
  if(JSON.stringify(oldValue) !== JSON.stringify(newValue))
  {
    const deviceNameText = device.name.padEnd(41, " ");
    const valueText = typeof(newValue) === "object" ? JSON.stringify(newValue) : newValue.toString();
    logger.output(`[ECHONETLite] prop changed: ${deviceNameText} ${propertyName} ${valueText}`);
    eventRepository.newEvent(`LOG`);
    restApiController.setNewEvent();
  }
});

const detailLogsCallback : ()=>{fileName:string, content:string}[] = ()=>{
  const fileName = "inputParameters.json";
  const content = JSON.stringify(inputParameters, null, 2);
  return [{fileName, content}];
}

const restApiController = new RestApiController(deviceStore, systemStatusRepository, eventRepository, logger, echoNetListController, restApiHost, restApiPort, restApiRoot, mqttBaseTopic, detailLogsCallback);
restApiController.addPropertyChangedRequestEvent(async (deviceId:string, propertyName:string, newValue:any):Promise<void>=>{

  const device = deviceStore.getFromNameOrId(deviceId);
  if(device === undefined){
    return;
  }
  const deviceNameText = device.name.padEnd(41, " ");
  const valueText = typeof(newValue) === "object" ? JSON.stringify(newValue) : newValue.toString();
  logger.output(`[RESTAPI]     prop changed: ${deviceNameText} ${propertyName} ${valueText}`);
  eventRepository.newEvent(`LOG`);

  await echoNetListController.setDeviceProperty({id: device.id, ip: device.ip, eoj:device.eoj, internalId:device.internalId}, propertyName, newValue);
});
restApiController.addPropertyRequestedRequestEvent(async (deviceId:string, propertyName:string):Promise<void>=>{
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

  const deviceNameText = device.name.padEnd(41, " ");
  logger.output(`[RESTAPI]     prop reuqest: ${deviceNameText} ${propertyName}`);
  eventRepository.newEvent(`LOG`);

  await echoNetListController.requestDeviceProperty({id: deviceId, ip: device.ip, eoj:device.eoj, internalId:device.internalId}, propertyName);
});

const mqttController = new MqttController(deviceStore, mqttBroker, mqttOption, mqttBaseTopic);
mqttController.addPropertyChnagedEvent(async (deviceId:string, propertyName:string, value:any, holdOption:HoldOption):Promise<void>=>{
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
  if(holdOption.holdTime > 0)
  {
    logger.output(`[MQTT] start hold value : ${deviceId} ${propertyName} ${value} holdOption=${JSON.stringify(holdOption)}`);
  }

  const deviceNameText = device.name.padEnd(41, " ");
  const valueText = typeof(value) === "object" ? JSON.stringify(value) : value.toString();
  logger.output(`[MQTT]        prop changed: ${deviceNameText} ${propertyName} ${valueText}`);
  eventRepository.newEvent(`LOG`);

  await echoNetListController.setDeviceProperty({id: device.id, ip: device.ip, eoj:device.eoj, internalId:device.internalId}, propertyName, value, holdOption);
});
mqttController.addPropertyRequestedEvent(async (deviceId:string, propertyName:string):Promise<void>=>{
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

  const deviceNameText = device.name.padEnd(41, " ");
  logger.output(`[MQTT]        prop reuqest: ${deviceNameText} ${propertyName}`);
  eventRepository.newEvent(`LOG`);

  await echoNetListController.requestDeviceProperty({id: deviceId, ip: device.ip, eoj:device.eoj, internalId:device.internalId}, propertyName);
});


mqttController.addConnectionStateChangedEvent(():void=>{
  systemStatusRepository.SystemStatus.mqttState = mqttController.ConnectionState;
  logger.output(`[MQTT] ${mqttController.ConnectionState}`);
  eventRepository.newEvent(`SYSTEM`);
  eventRepository.newEvent(`LOG`);
  restApiController.setNewEvent();
});

restApiController.start();
mqttController.start();
if(mqttBroker === "")
{
  logger.output(`[MQTT] mqttBroker is not configured.`);
}

echoNetListController.start();

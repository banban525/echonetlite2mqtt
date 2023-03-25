import EL, { eldata,rinfo } from "echonet-lite";
import os from "os";
import ip from "ip";
import { AliasOption, Device, DeviceAlias, DeviceId } from "./Property";
import EchoNetDeviceConverter from "./EchoNetDeviceConverter";
import { EchoNetLiteRawController } from "./EchoNetLiteRawController";


export class EchoNetLiteController{
  
  private readonly aliasOption: AliasOption;
  private readonly echonetLiteRawController:EchoNetLiteRawController;
    constructor(echonetTargetNetwork:string, intervalToGetProperties:number, aliasOption: AliasOption){
  
      this.aliasOption = aliasOption;
      const deviceConverter = new EchoNetDeviceConverter(this.aliasOption);
      this.echonetLiteRawController = new EchoNetLiteRawController(deviceConverter);
      let usedIpByEchoNet = "";
      if (echonetTargetNetwork.match(/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+\/[0-9]+/)) {
        const interfaces = os.networkInterfaces();
        const matchedNetworkAddresses = Object.keys(interfaces)
          .map((key) => interfaces[key])
          .flat()
          .filter((_) => _!==undefined && ip.cidrSubnet(echonetTargetNetwork).contains(_.address));
        
        if(matchedNetworkAddresses.length >= 1)
        {
          usedIpByEchoNet = matchedNetworkAddresses[0]?.address ?? "";
        }
      }
  
  
      var objList = ['05ff01'];
  
      EL.initialize(objList, ( rinfo:rinfo, els:eldata ):void=>{
        // if(els.SEOJ === "026302")
        // {
        //   const b = JSON.stringify(els);
        //   console.log(`recieved:` + b);  
        // }
        
        if(els.ESV === EL.SET_RES)
        {
          for(const propertyCode in els.DETAILs)
          {
            //console.log(`sendOPC1 ${rinfo.address} ${els.SEOJ} ${EL.GET} ${propertyCode} `);
            EL.sendOPC1(rinfo.address, "05ff01", els.SEOJ, EL.GET, propertyCode, "");
          }
        }
        if(els.ESV === EL.GET_RES)
        {
          const deviceId = this.detectedDeviceIds.find(_=>_.ip === rinfo.address &&  _.eoj === els.SEOJ);
          if(deviceId===undefined){
            return;
          }
          for(const propertyCode in els.DETAILs)
          {
            const property = deviceConverter.getPropertyWithEpc(deviceId, propertyCode);
            if(property===undefined){
              continue;
            }
            const value = deviceConverter.getPropertyValue(deviceId, property);
            this.firePropertyChnagedEvent(deviceId, property.name, value);
          }
        }
        if(els.ESV === EL.INF)
        {
          const deviceId = this.detectedDeviceIds.find(_=>_.ip === rinfo.address &&  _.eoj === els.SEOJ);
          if(deviceId===undefined){
            return;
          }
          for(const propertyCode in els.DETAILs)
          {
            const property = deviceConverter.getPropertyWithEpc(deviceId, propertyCode);
            if(property===undefined){
              continue;
            }
            const value = deviceConverter.getPropertyValue(deviceId, property);
            this.firePropertyChnagedEvent(deviceId, property.name, value);
          }
        }
  

        this.echonetLiteRawController.reveivePacketProc(rinfo, els);
      }, 4, {v4:usedIpByEchoNet, autoGetDelay:intervalToGetProperties, autoGetProperties:true});
      
      
      EL.setObserveFacilities(1000, () => {
        const idList = deviceConverter.getDeviceIdList(EL.facilities);
  
        let detected=false;
        for(const id of idList)
        {
          const foundId = this.detectedDeviceIds.find(_=>_.id === id.id);
          if(foundId===undefined){
            this.detectedDeviceIds.push(id);
            detected=true;
          }
        }
        if(detected){
          this.fireDeviceDetected();
        }
        //console.dir(EL.facilities);
          // if(deviceStore.exists(id.id) === false)
          // {
          //   const device = deviceConverter.createDevice(id, EL.facilities);
          //   if(device !== undefined)
          //   {
          //     deviceStore.add(device);
          //     //deviceListTemp[id.id] = device;
          //     console.dir(device.propertiesValue);
          //   }
          // }
        
      });

      this.echonetLiteRawController.start();
    }
    detectedDeviceIds:DeviceId[] = [];
    getDetectedDeviceIds = ():DeviceId[]=>{
      return this.detectedDeviceIds;
    }
  
    getDevice = (id:DeviceId):Device|undefined => {
      const deviceConverter = new EchoNetDeviceConverter(this.aliasOption);
  
      const device = deviceConverter.createDevice(id, EL.facilities);
      return device;
    }
  
    propertyChnagedListeners:((id:DeviceId, propertyName:string, newValue:any)=>void)[] = [];
    addPropertyChnagedEvent = (event:(id:DeviceId, propertyName:string, newValue:any)=>void)=>{
      this.propertyChnagedListeners.push(event);
    }
    firePropertyChnagedEvent = (id:DeviceId, propertyName:string, newValue:any):void=>{
      this.propertyChnagedListeners.forEach((_)=>_(id, propertyName, newValue));
    }
    // propertyChnaged: (id:DeviceId, propertyName:string, newValue:any)=>void = ()=>{
    //   // event
    // };
    deviceDetectedListeners:(()=>void)[] = [];
    addDeviceDetectedEvent = (event:()=>void):void =>{
      this.deviceDetectedListeners.push(event);
    }
    fireDeviceDetected = ():void=>{
      this.deviceDetectedListeners.forEach(_=>_());
    }
    
    setDeviceProperty = (id:DeviceId, propertyName:string, newValue:any):void =>{
      const deviceConverter = new EchoNetDeviceConverter(this.aliasOption);
      const property = deviceConverter.getProperty(id, propertyName);
  
  
      const echoNetData = deviceConverter.propertyToEchoNetData(id, propertyName, newValue);
      if(echoNetData===undefined)
      {
        console.log(`setDeviceProperty echoNetData===undefined newValue=${newValue}`);
        return;
      }
      if(property === undefined)
      {
        console.log(`setDeviceProperty property === undefined propertyName=${propertyName}`);
        return;
      }
      let epc = property.epc;
      if(epc.toLowerCase().startsWith("0x"))
      {
        epc = epc.replace(/^0x/gi, "");
      }
      setTimeout(() => {
        console.log(`[ECHONETLite] send ${id.ip} ${id.eoj} ${EL.SETC} ${epc} ${echoNetData}`);
        EL.sendOPC1(id.ip, "05ff01", id.eoj, EL.SETC, epc, echoNetData);
        EL.decreaseWaitings();
      }, EL.autoGetDelay * (EL.autoGetWaitings+1));
      EL.increaseWaitings();
    }
    start = ():void=>{
      EL.search();
    }

    requestDeviceProperty = (id:DeviceId, propertyName:string):void =>{
      const deviceConverter = new EchoNetDeviceConverter(this.aliasOption);
      const property = deviceConverter.getProperty(id, propertyName);
      if(property === undefined)
      {
        console.log(`setDeviceProperty property === undefined propertyName=${propertyName}`);
        return;
      }

      let epc = property.epc;
      if(epc.toLowerCase().startsWith("0x"))
      {
        epc = epc.replace(/^0x/gi, "");
      }
      setTimeout(() => {
        console.log(`[ECHONETLite] send ${id.ip} ${id.eoj} ${EL.GET} ${epc}`);
        EL.sendOPC1(id.ip, "05ff01", id.eoj, EL.GET, epc, [0x00]);
        EL.decreaseWaitings();
      }, EL.autoGetDelay * (EL.autoGetWaitings+1));
      EL.increaseWaitings();

    }

    public getRawData = ():unknown=>
    {
      return EL.facilities;
    }
  }
  
import EL, { eldata,rinfo } from "echonet-lite";
import os from "os";
import ip from "ip";
import { Device, DeviceId } from "./Property";
import EchoNetDeviceConverter from "./EchoNetDeviceConverter";


export class EchoNetLiteController{
  
    constructor(echonetTargetNetwork:string, intervalToGetProperties:number){
  
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
  
      const deviceConverter = new EchoNetDeviceConverter();
  
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
    }
    detectedDeviceIds:DeviceId[] = [];
    getDetectedDeviceIds = ():DeviceId[]=>{
      return this.detectedDeviceIds;
    }
  
    getDevice = (id:DeviceId):Device|undefined => {
      const deviceConverter = new EchoNetDeviceConverter();
  
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
      const deviceConverter = new EchoNetDeviceConverter();
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
      console.log(`[ECHONETLite] send ${id.ip} ${id.eoj} ${EL.SETC} ${epc} ${echoNetData}`);
      EL.sendOPC1(id.ip, "05ff01", id.eoj, EL.SETC, epc, echoNetData);
    }
    start = ():void=>{
      EL.search();
    }

    requestDeviceProperty = (id:DeviceId, propertyName:string):void =>{
      const deviceConverter = new EchoNetDeviceConverter();
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
      console.log(`[ECHONETLite] send ${id.ip} ${id.eoj} ${EL.GET} ${epc}`);
      EL.sendOPC1(id.ip, "05ff01", id.eoj, EL.GET, epc, [0x00]);
    }
  }
  
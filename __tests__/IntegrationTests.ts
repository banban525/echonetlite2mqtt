import * as child_process from 'child_process';
import * as util from 'util';
import {ComposeSpecification} from './compose-spec';
import yaml from "js-yaml";
import fs from "fs";
import fetch from "node-fetch";
import path from "path";
import { ServerStatus } from '../server/ApiTypes';

const execFile = util.promisify(child_process.execFile);


const defaultCompose : ComposeSpecification = {
    services:{
      echonetlite2mqtt:{
        build: ".",
        ports:["3000:3000"],
        networks:{
          echonet_network_test:{
            ipv4_address:"10.254.247.2"
          }
        }
      },
      aircon01:{
        image:"banban525/echonet-lite-kaden-emulator:latest",
        ports:["3001:3000"],
        volumes:[
          //"./test/aircon01-settings.json:/home/node/app/config/aircon01-settings.json"
        ],
        environment:{
          //SETTINGS: "/home/node/app/config/aircon01-settings.json"
        },
        networks:{
          echonet_network_test:{
            ipv4_address:"10.254.247.3"
          }
        }
      }
    },
    networks:{
      echonet_network_test:{
        ipam:{
          driver:"default",
          config:[
            {
              subnet:"10.254.247.0/24"
            }
          ]
        }
      }
    }
  }
  
  async function getJson<T>(url:string, timeout:number, checkCallback:(json:T)=>boolean):Promise<T|undefined>
  {
    let result:T|undefined = undefined;
    for(let i=0; i<timeout/500; i++){
      try
      {
        const res = await fetch(url, {timeout:500});
        result = await res.json() as T;
      }
      catch(e)
      {
        // retry
      }
      if(result!==undefined && checkCallback(result))
      {
        return result;
      }
      await new Promise((resolve)=>setTimeout(resolve, 500));
    }
    return undefined;
  }
  
  
  test("check", async ():Promise<void> => {

    try
    {
      await execFile('docker', ["-v"]);
    }
    catch(e)
    {
      console.log("Docker is not installed. Skip this test."); 
      return;
    }
  

    const yml = yaml.dump(defaultCompose);
    fs.writeFileSync(path.resolve(__dirname, "../compose.yml"), yml, {encoding:"utf-8"});
    await execFile('docker', ['compose', "-f", path.resolve(__dirname, "../compose.yml"), 'up', "-d"]);
  
    let lastStatus = await getJson<ServerStatus>(
      "http://localhost:3000/api/status", 
      5*1000, 
      (json:ServerStatus)=>json?.systemVersion !== "");
    
    // EchonetLite2MQTTが起動してバージョンが取得できること
    expect(lastStatus).not.toBe(undefined);
    expect(lastStatus?.systemVersion).not.toBe("");
    console.log(`OK:${lastStatus?.systemVersion}`);
  
    lastStatus = await getJson<ServerStatus>(
      "http://localhost:3000/api/status", 
      60*1000, 
      (json:ServerStatus)=>json?.devices.length > 0
    );
  
    // デバイスが検出できていること
    expect(lastStatus).not.toBe(undefined);
    expect(lastStatus?.devices.length).not.toBe(0);
  
    const { stdout, stderr } = await execFile('docker', ['ps']);
    console.log('stdout:', stdout);
    console.log('stderr:', stderr);
  
    await execFile('docker', ['compose', 'down']);
  
  }, 120*1000);
  
  
  
  
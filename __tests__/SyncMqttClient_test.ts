import { SyncMqttClient } from "../server/ElwaController";
import mqtt, { IPublishPacket, ISubscriptionGrant } from "mqtt";
import Aedes from 'aedes'
import { createServer } from 'net'

const sleep = (ms:number) => new Promise<void>((resolve) => {
  setTimeout(() => {
    resolve();
  }, ms);
});

test("Test: normal process", async ():Promise<void> => {

  // テスト用のMQTTブローカーを立ち上げる
  const port = 1883

  const aedes = new Aedes()
  const mqttServer = createServer(aedes.handle)
  
  await new Promise<void>((resolve) => {
    mqttServer.listen(port, function () {
      resolve();
    });
  });

  
  // MQTTクライアント
  const mqttClient = mqtt.connect("mqtt://localhost", {
    port
  });

  // 接続完了を待つ
  await new Promise<void>((resolve) => {
    mqttClient.on("connect", () => {
      resolve();
    });
  });

  // テスト対象の同期MQTTクライアント
  const syncMqttClinet = new SyncMqttClient(mqttClient, "tests/cmdreport", 10*1000);

  const asyncRes = syncMqttClinet.publishAndWaitResponse("tests/sendcmd", {id:"aaa"}, {});

  await sleep(200);

  syncMqttClinet.receiveMessage("tests/cmdreport", JSON.stringify({topic:"tests/sendcmd", status:200, note:""}));

  const res = await asyncRes;
  expect(res.topic).toBe("tests/sendcmd");
  expect(res.status).toBe(200);


  mqttClient.end();
  mqttServer.close();
  aedes.close();


});


test("Test: timeout", async ():Promise<void> => {

    // テスト用のMQTTブローカーを立ち上げる
    const port = 2883
  
    const aedes = new Aedes()
    const mqttServer = createServer(aedes.handle)
    
    await new Promise<void>((resolve) => {
      mqttServer.listen(port, function () {
        resolve();
      });
    });
  
    
    // MQTTクライアント
    const mqttClient = mqtt.connect("mqtt://localhost", {
      port
    });
  
    // 接続完了を待つ
    await new Promise<void>((resolve) => {
      mqttClient.on("connect", () => {
        resolve();
      });
    });
  
    // テスト対象の同期MQTTクライアント
    const syncMqttClinet = new SyncMqttClient(mqttClient, "tests/cmdreport", 100);
  
    const asyncRes = syncMqttClinet.publishAndWaitResponse("tests/sendcmd", {id:"aaa"}, {});
  
    await sleep(300);
  
    syncMqttClinet.receiveMessage("tests/cmdreport", JSON.stringify({topic:"tests/sendcmd", status:200, note:""}));
  
    const res = await asyncRes;
    expect(res.topic).toBe("tests/sendcmd");
    expect(res.status).toBe(500);
    expect(res.note).toBe("timeout");
 
  
    mqttClient.end();
    mqttServer.close();
    aedes.close();
  
  
  }, 60*1000);
  
  
import 'jest';

import EchoNetDeviceConverter from "../server/EchoNetDeviceConverter";
import { RawDataSet } from "../server/EchoNetCommunicator";
import { EchoNetLiteRawController } from "../server/EchoNetLiteRawController";

class RawDataSetForTest implements RawDataSet {
  public existsDevice = (_ip: string, _eoj: string): boolean => false;
  public existsData = (_ip: string, _eoj: string, _epc: string): boolean => false;
  public getIpList = (): string[] => [];
  public getEojList = (_ip: string): string[] => [];
  public getRawData = (_ip: string, _eoj: string, epc: string): string | undefined => {
    if(epc !== "9f") {
      return undefined;
    }
    return "40A595D5A7C4C4C5869795A7E471339392";
  };
}

test("convert bitmap-format property maps", () => {
  const expected = [
    "80", "a0", "d0", "f0",
    "81", "a1", "c1", "f1",
    "82", "a2", "c2", "e2", "f2",
    "83", "93", "a3", "d3", "f3",
    "a4", "e4", "f4",
    "a5", "e5", "f5",
    "86", "a6", "e6", "f6",
    "97", "a7", "f7",
    "88", "98", "a8", "c8", "f8",
    "89", "a9", "c9", "f9",
    "8a", "9a", "aa", "da", "fa",
    "ab", "db", "eb", "fb",
    "8c", "cc", "dc", "ec",
    "8d", "9d", "cd", "dd",
    "8e", "9e", "ce", "fe",
    "9f", "cf", "ff"
  ];

  expect(EchoNetLiteRawController.convertToPropertyList("40A595D5A7C4C4C5869795A7E471339392")).toEqual(expected);

  const converter = new EchoNetDeviceConverter({ aliases: [] }, false, []);
  expect(converter.convertGetPropertyNoList("192.0.2.1", "027d1f", new RawDataSetForTest())).toEqual(expected);
});

test("convert already-expanded property maps", () => {
  expect(EchoNetLiteRawController.convertToPropertyList("048082838A")).toEqual([
    "80", "82", "83", "8a"
  ]);
});

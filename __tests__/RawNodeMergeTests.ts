import 'jest';
import { EchoNetLiteRawController, RawNode } from '../server/EchoNetLiteRawController';

const mergeNode = (current:RawNode|undefined, next:RawNode):RawNode =>
  (EchoNetLiteRawController as any).mergeNode(current, next) as RawNode;

const property = (epc:string, value:string, operation:{get?:boolean, set?:boolean, inf?:boolean}) => ({
  ip: '192.168.11.249',
  eoj: '027201',
  epc,
  value,
  operation: {
    get: operation.get === true,
    set: operation.set === true,
    inf: operation.inf === true
  }
});

describe('raw node discovery merge', () => {
  test('keeps devices missing from a later partial scan', () => {
    const current:RawNode = {
      ip: '192.168.11.249',
      devices: [
        {ip: '192.168.11.249', eoj: '0ef001', noExistsId: false, properties: []},
        {ip: '192.168.11.249', eoj: '027201', noExistsId: false, properties: [property('83', 'id-water-heater', {get: true})]}
      ]
    };
    const next:RawNode = {
      ip: '192.168.11.249',
      devices: [
        {ip: '192.168.11.249', eoj: '0ef001', noExistsId: false, properties: []}
      ]
    };

    const merged = mergeNode(current, next);

    expect(merged.devices.map(_=>_.eoj)).toEqual(['0ef001', '027201']);
  });

  test('preserves previous property values when a later scan times out', () => {
    const current:RawNode = {
      ip: '192.168.11.249',
      devices: [
        {
          ip: '192.168.11.249',
          eoj: '027201',
          noExistsId: false,
          properties: [
            property('83', 'id-water-heater', {get: true}),
            property('8a', '000082', {get: true})
          ]
        }
      ]
    };
    const next:RawNode = {
      ip: '192.168.11.249',
      devices: [
        {
          ip: '192.168.11.249',
          eoj: '027201',
          noExistsId: true,
          properties: [
            property('83', '', {get: true}),
            property('9f', '02838a', {})
          ]
        }
      ]
    };

    const merged = mergeNode(current, next);
    const mergedDevice = merged.devices.find(_=>_.eoj === '027201');

    expect(mergedDevice?.noExistsId).toBe(false);
    expect(mergedDevice?.properties.find(_=>_.epc === '83')?.value).toBe('id-water-heater');
    expect(mergedDevice?.properties.find(_=>_.epc === '8a')?.value).toBe('000082');
    expect(mergedDevice?.properties.find(_=>_.epc === '9f')?.value).toBe('02838a');
  });

  test('updates property values and keeps operation flags from both scans', () => {
    const current:RawNode = {
      ip: '192.168.11.249',
      devices: [
        {
          ip: '192.168.11.249',
          eoj: '027201',
          noExistsId: false,
          properties: [property('80', '31', {get: true})]
        }
      ]
    };
    const next:RawNode = {
      ip: '192.168.11.249',
      devices: [
        {
          ip: '192.168.11.249',
          eoj: '027201',
          noExistsId: false,
          properties: [property('80', '30', {inf: true})]
        }
      ]
    };

    const merged = mergeNode(current, next);
    const mergedProperty = merged.devices[0].properties.find(_=>_.epc === '80');

    expect(mergedProperty?.value).toBe('30');
    expect(mergedProperty?.operation).toEqual({get: true, set: false, inf: true});
  });
});

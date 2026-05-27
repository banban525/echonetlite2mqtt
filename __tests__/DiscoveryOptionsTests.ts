import 'jest';
import { parseDiscoveryPeriodicInterval, parseDiscoveryStartupRetryIntervals } from '../server/discoveryOptions';

describe('discovery option parser', () => {
  test('parse startup retry intervals', () => {
    expect(parseDiscoveryStartupRetryIntervals('15,60')).toEqual([15, 60]);
    expect(parseDiscoveryStartupRetryIntervals('"5, 30"')).toEqual([5, 30]);
  });

  test('allow empty startup retry intervals', () => {
    expect(parseDiscoveryStartupRetryIntervals('')).toEqual([]);
    expect(parseDiscoveryStartupRetryIntervals('""')).toEqual([]);
  });

  test('reject invalid startup retry intervals', () => {
    expect(parseDiscoveryStartupRetryIntervals('15,-1')).toBeUndefined();
    expect(parseDiscoveryStartupRetryIntervals('15,abc')).toBeUndefined();
  });

  test('parse periodic discovery interval', () => {
    expect(parseDiscoveryPeriodicInterval('0')).toBe(0);
    expect(parseDiscoveryPeriodicInterval('"120"')).toBe(120);
  });

  test('reject invalid periodic discovery interval', () => {
    expect(parseDiscoveryPeriodicInterval('')).toBeUndefined();
    expect(parseDiscoveryPeriodicInterval('-1')).toBeUndefined();
    expect(parseDiscoveryPeriodicInterval('abc')).toBeUndefined();
  });
});

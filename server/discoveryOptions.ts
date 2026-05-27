export const parseDiscoveryStartupRetryIntervals = (value:string):number[]|undefined => {
  const normalized = value.replace(/^"/g, "").replace(/"$/g, "").trim();
  if(normalized === "")
  {
    return [];
  }

  const result:number[] = [];
  for(const text of normalized.split(","))
  {
    const interval = Number(text.trim());
    if(isNaN(interval) || interval < 0)
    {
      return undefined;
    }
    result.push(interval);
  }
  return result;
};

export const parseDiscoveryPeriodicInterval = (value:string):number|undefined => {
  const normalized = value.replace(/^"/g, "").replace(/"$/g, "").trim();
  const interval = Number(normalized);
  if(normalized === "" || isNaN(interval) || interval < 0)
  {
    return undefined;
  }
  return interval;
};

type Func = (...args: any[]) => void;

export const debounce = (func: Func, debounceTimeMs: number) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: any[]) => {
  
    if (timeout)
      clearTimeout(timeout);

    timeout = setTimeout(func, debounceTimeMs, ...args);
  }
}
export interface SanitiseOptions {
  keys: string[];
  replaceWith: string;
}

export function sanitise(obj, opts: Partial<SanitiseOptions> = {}): any {
  const { replaceWith = '[redacted]', keys = [] } = opts;

  if (Array.isArray(obj)) {
    return obj.map(entry => sanitise(entry, opts));
  }
  if (typeof obj === 'object') {
    return Object.keys(obj).reduce((res, key) => {
      const val = keys.includes(key) ? replaceWith : sanitise(obj[key], opts);

      return Object.assign({}, res, { [key]: val });
    }, {});
  }

  return obj;
}

export default sanitise;

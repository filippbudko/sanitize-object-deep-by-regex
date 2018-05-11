export interface SanitiseOptions {
  keys: string[];
  regex: RegExp[];
  replaceWith: string;
}
export function isBlacklisted(
  key: string,
  fullPath: string,
  opts: SanitiseOptions,
): boolean {
  const { keys, regex } = opts;
  if (keys.includes(key)) {
    return true;
  }

  for (const reg of regex) {
    if (reg.test(fullPath)) {
      return true;
    }
  }

  return false;
}

export function sanitise(
  obj,
  opts: Partial<SanitiseOptions> = {},
  path = '',
): any {
  const { replaceWith = '[redacted]', keys = [], regex = [] } = opts;

  if (Array.isArray(obj)) {
    const newPath = path + '[]';
    return obj.map(entry => sanitise(entry, opts, path));
  }
  if (typeof obj === 'object') {
    return Object.keys(obj).reduce((res, key) => {
      const prefix = path ? `${path}.` : '';
      const fullPath = prefix + key;

      const val = isBlacklisted(key, fullPath, { replaceWith, keys, regex })
        ? replaceWith
        : sanitise(obj[key], opts, fullPath);

      return Object.assign({}, res, { [key]: val });
    }, {});
  }

  return obj;
}

export default sanitise;

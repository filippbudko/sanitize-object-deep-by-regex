export interface SanitiseOptions {
  keys: string[];
  regex: RegExp[];
  replaceWith: string;
}
export function isBlacklisted(
  key: string,
  fullPath: string,
  keys: Set<string>,
  regex: RegExp[],
): boolean {
  if (keys.has(key)) {
    return true;
  }

  for (const reg of regex) {
    if (reg.test(fullPath)) {
      return true;
    }
  }

  return false;
}

function _sanitise(
  obj,
  keys: Set<string>,
  regex: RegExp[],
  replaceWith: string,
  path: string,
  seenObjects: WeakMap<any, any>,
) {
  if (seenObjects.has(obj)) {
    return seenObjects.get(obj);
  }

  if (Array.isArray(obj)) {
    const newPath = path + '[]';
    const newArray = [];
    seenObjects.set(obj, newArray);

    obj.forEach(entry => {
      newArray.push(
        _sanitise(entry, keys, regex, replaceWith, newPath, seenObjects),
      );
    });

    return newArray;
  }

  if (typeof obj === 'object') {
    const newObj: any = {};
    seenObjects.set(obj, newObj);
    return Object.keys(obj).reduce((res, key) => {
      const prefix = path ? `${path}.` : '';
      const fullPath = prefix + key;

      const val = isBlacklisted(key, fullPath, keys, regex)
        ? replaceWith
        : _sanitise(obj[key], keys, regex, replaceWith, fullPath, seenObjects);

      res[key] = val;
      return res;
    }, newObj);
  }

  return obj;
}

export function sanitise(
  obj,
  opts: Partial<SanitiseOptions> = {},
  path = '',
): any {
  const { replaceWith = '[redacted]', keys = [], regex = [] } = opts;
  const seenObjects = new WeakMap<any, any>();

  return _sanitise(obj, new Set(keys), regex, replaceWith, path, seenObjects);
}

export default sanitise;

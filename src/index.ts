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
) {
  if (Array.isArray(obj)) {
    const newPath = path + '[]';
    return obj.map(entry =>
      _sanitise(entry, keys, regex, replaceWith, newPath),
    );
  }
  if (typeof obj === 'object') {
    return Object.keys(obj).reduce((res: object, key) => {
      const prefix = path ? `${path}.` : '';
      const fullPath = prefix + key;

      const val = isBlacklisted(key, fullPath, keys, regex)
        ? replaceWith
        : _sanitise(obj[key], keys, regex, replaceWith, fullPath);

      return {
        ...res,
        [key]: val,
      };
    }, {});
  }
  return obj;
}

export function sanitise(
  obj,
  opts: Partial<SanitiseOptions> = {},
  path = '',
): any {
  const { replaceWith = '[redacted]', keys = [], regex = [] } = opts;

  return _sanitise(obj, new Set(keys), regex, replaceWith, path);
}

export default sanitise;

export function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
}

export function getValueAtPath(object, path) {
  return path.reduce((current, segment) => current?.[segment], object);
}

export function setValueAtPath(object, path, nextValue) {
  if (path.length === 0) {
    return nextValue;
  }

  const [segment, ...rest] = path;

  if (Array.isArray(object)) {
    const copy = [...object];
    copy[segment] = rest.length === 0 ? nextValue : setValueAtPath(copy[segment], rest, nextValue);
    return copy;
  }

  return {
    ...object,
    [segment]: rest.length === 0 ? nextValue : setValueAtPath(object?.[segment], rest, nextValue),
  };
}

export function removeArrayItemAtPath(object, path, index) {
  const array = getValueAtPath(object, path);
  const nextArray = array.filter((_, itemIndex) => itemIndex !== index);
  return setValueAtPath(object, path, nextArray);
}

export function moveArrayItemAtPath(object, path, fromIndex, toIndex) {
  const array = [...(getValueAtPath(object, path) || [])];
  const [item] = array.splice(fromIndex, 1);
  array.splice(toIndex, 0, item);
  return setValueAtPath(object, path, array);
}

export function addArrayItemAtPath(object, path, item) {
  const array = getValueAtPath(object, path) || [];
  return setValueAtPath(object, path, [...array, item]);
}

export function isMediaAssetRef(value) {
  return Boolean(
    value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      'path' in value &&
      'url' in value &&
      'alt' in value,
  );
}

export function humanizeKey(key) {
  return String(key)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function createBlankValue(template) {
  if (Array.isArray(template)) {
    return [];
  }

  if (template === null || template === undefined) {
    return '';
  }

  if (typeof template === 'string') {
    return '';
  }

  if (typeof template === 'number') {
    return 0;
  }

  if (typeof template === 'boolean') {
    return false;
  }

  if (typeof template === 'object') {
    return Object.fromEntries(
      Object.entries(template).map(([key, value]) => [key, createBlankValue(value)]),
    );
  }

  return '';
}

export function collectMediaRefs(value, path = [], results = []) {
  if (isMediaAssetRef(value)) {
    results.push({
      path,
      value,
    });
    return results;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => collectMediaRefs(item, [...path, index], results));
    return results;
  }

  if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, nested]) => collectMediaRefs(nested, [...path, key], results));
  }

  return results;
}

export const escapeHtml = (str: string): string =>
  str
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\//g, '&#x2F;')
    .replace(/\\/g, '&#x5C;')
    .replace(/`/g, '&#96;');

const keysToExclude = ['password'];

export const sanitizeRequestBody = (body: any) => {
  if (Array.isArray(body)) {
    return body.map((item) => sanitizeRequestBody(item));
  }

  if (body !== null && typeof body === 'object') {
    return Object.entries(body).reduce<Record<string, any>>((sanitizedObject, [key, value]) => {
      sanitizedObject[key] = keysToExclude.includes(key.trim().toLowerCase()) ? value : sanitizeRequestBody(value);
      return sanitizedObject;
    }, {});
  }

  return typeof body === 'string' ? escapeHtml(body) : body;
};

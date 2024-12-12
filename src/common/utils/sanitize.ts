import * as sanitize from 'sanitize-html';

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

  return typeof body === 'string' ? sanitize(body) : body;
};

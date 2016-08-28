export const SSO_LOGIN_COOKIE = 'GDCSSOLogin';

export const isLoggedInViaSso = (docInstance = document) => docInstance.cookie.indexOf(SSO_LOGIN_COOKIE) !== -1;

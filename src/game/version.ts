declare const __APP_VERSION__: string;
declare const __APP_COMMIT__: string;

export const APP_VERSION = `v${__APP_VERSION__}${__APP_COMMIT__ ? ` (${__APP_COMMIT__})` : ''}`;

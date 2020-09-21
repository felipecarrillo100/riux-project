import { setLicenseText } from '@luciad/ria/util/License';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const licenseText = require('!!url-loader!../../licenses/luciadria_development.txt')
    .default;

function decodeBase64StringToPlainText(licenseBase64: string) {
    // Base64 String has the format: data:text/plain;base64,code
    const parts = licenseBase64.split(',');
    return parts.length === 2 ? atob(parts[1]) : '';
}

setLicenseText(decodeBase64StringToPlainText(licenseText));

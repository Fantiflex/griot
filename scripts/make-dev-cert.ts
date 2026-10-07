import fs from 'fs';
import os from 'os';
import path from 'path';
import selfsigned from 'selfsigned';

/**
 * Génère un certificat auto-signé pour servir l'appli en HTTPS sur le réseau local.
 * Nécessaire : la caméra du téléphone (getUserMedia) n'est autorisée qu'en HTTPS ou sur localhost.
 * Usage : npm run cert:dev  puis  SSL_CERT=certs/dev-cert.pem SSL_KEY=certs/dev-key.pem npm run dev
 */

const outDir = path.resolve('certs');
fs.mkdirSync(outDir, { recursive: true });

const lanIps = Object.values(os.networkInterfaces())
  .flat()
  .filter((i): i is os.NetworkInterfaceInfo => Boolean(i && i.family === 'IPv4' && !i.internal))
  .map((i) => i.address);

const altNames = [
  { type: 2 as const, value: 'localhost' },
  { type: 7 as const, ip: '127.0.0.1' },
  ...lanIps.map((ip) => ({ type: 7 as const, ip })),
];

const pems = await selfsigned.generate([{ name: 'commonName', value: 'legriot.local' }], {
  notAfterDate: new Date(Date.now() + 365 * 24 * 3600 * 1000),
  keySize: 2048,
  algorithm: 'sha256',
  extensions: [{ name: 'subjectAltName', altNames }],
});

fs.writeFileSync(path.join(outDir, 'dev-cert.pem'), pems.cert);
fs.writeFileSync(path.join(outDir, 'dev-key.pem'), pems.private);

console.log(`Certificat écrit dans ${outDir}`);
console.log(`Adresses couvertes : localhost, 127.0.0.1${lanIps.length ? ', ' + lanIps.join(', ') : ''}`);
console.log('Lancer ensuite :');
console.log('  SSL_CERT=certs/dev-cert.pem SSL_KEY=certs/dev-key.pem npm run dev');
console.log('Sur le téléphone, accepter l’avertissement de certificat une seule fois.');

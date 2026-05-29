const { Omniston } = require('@ston-fi/omniston-sdk-react');

const instance = new Omniston({ apiUrl: "wss://omni-ws.ston.fi" });
const proto = Object.getPrototypeOf(instance);
const methods = Object.getOwnPropertyNames(proto).filter(name => typeof instance[name] === 'function');
console.log(methods);

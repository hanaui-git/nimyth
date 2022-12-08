# Nimyth(Beta)
Your wonderful & powerful passwords generator framework.

## Installation
Github:
```
git clone https://github.com/hanaui-git/nimyth
```
NpmJS:
```
npm i xchacha20-js randomstring randombytes readline-sync request-async clipboardy@1.2.3 js-string-compression hqc dialogy moment chalk@2.4.2 fs csv-stringify dialogy util
```

## Usage
```
node index.js
```

## Q&A
### How secure is Nimyth?
Nimyth is really secure in fact It uses XCHACHA20, End to End encryption, AES256 and at the same time a custom cipher. To make it 10x secure increase the characters of the keys in the server and obfuscate the code.

### How can I change Nimyth server?
Open index.js and search **serverURL**.

### How can I see Nimyth options?
Open options.json

## Note
Please change the keys in options.json > security and nonce length should be 24 and xChaChaKey length should be 32

## License
MIT © Hanaui
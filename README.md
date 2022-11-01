# Nimyth(Beta)
Your wonderful & powerful passwords generator framework.

## Installation
Github:
```
git clone https://github.com/hanaui-git/nimyth
```
NpmJS:
```
npm i randomstring randombytes readline-sync request-async clipboardy@1.2.3 sovrin-did is-online8.5.1 moment chalk@2.4.2 fs
```

## Usage
```
node index.js
```

## Q&A
### How secure is Nimyth?
Nimyth is really secure in fact It uses XCHACHA20, End to End encryption, AES256 and at the same time a custom cipher. To make it 10x secure increase the characters of the keys in the server and obfuscate the code.

### Is the current server of Nimyth secure?
Yes, It uses a key that is 80+ characters(I can't say the length of the other keys for security reasons) and the code is highly obfuscated(Private) even I, don't know the keys and It also has a good custom cipher. But If you are privacy paranoid you can host your own [server](https://github.com/hanaui-git/nimyth-server).

### How can I change Nimyth server?
Open index.js and search **serverURL**.

### How can I see Nimyth options?
Open options.json

## License
MIT © Hanaui
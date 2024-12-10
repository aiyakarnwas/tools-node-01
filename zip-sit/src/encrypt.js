const fs = require("fs");
const gpg = require("gpg");

process.env.HASH_NAME = "sha256";

const randomString = (length) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
};

const key = `-----BEGIN PGP PUBLIC KEY BLOCK-----

mQGNBGOa9GQBDADngyslDJWaY63xgpBz7az34AJ3P+Ai+Ez7Dq1O1a1rz2wnOXjo
rQDAvSd3EPwkSI1MDwRL1CplpPqYUF+Bb1FLCEHcMPIDSj6+w4Wg/rVYOZbT7wTy
rF0doooySyCBZdQjL6NetrcbOds7AIEvZPKvV77BRUBgEAKDSkVx8ovkp3aDxim9
r0jmWbnX8evhgndFTfapafpZi2AixTXNBPI3gHm1RVdMww+HmXYOfwqoga3imvHt
pHBISb5UBM0/nomEbyNEngYjr7HusnDNFC5Mcq9vxbumctpR0d9nQffAG4jtuF7+
DEsZWm+nLTNfHze55mr3HtnJrJXoxBo/tXvvISEECxuDExbrkuytSn8HTTCuMnSk
QO6XcwaYRtob91yK+JlW1HEY61lvNT+49ihTQVHVepsC5Sm9BMDmoLj4o/q9Rj9U
vIylCz4mO5QMBBhMLAstY72UbnRqUuJ36px+T3o+3tMuntyaVQShdCfW3/wrLJz7
Xp25VJd5XCnZ6h0AEQEAAbRHZGVidC1hY3FfYXNjZW5kX3RjcmJfbm9ucHJvZCA8
ZGVidC1hY3FfYXNjZW5kX3RjcmJfbm9ucHJvZEB0Y3JiYW5rLmNvbT6JAdIEEwEI
ADwWIQTghwNuKAP46YLGvqWjkHFeAMhq9gUCY5r0ZAIbAwULCQgHAgMiAgEGFQoJ
CAsCBBYCAwECHgcCF4AACgkQo5BxXgDIavaunwwA2+nsJjF4XrF6ApgGMkWCWGQ0
LhncoE06r9Z0M3abOfnARIWQfdIgNAB2RNUDFa+nlVW5c9hgpPx9OzDE2NWM2R0S
5EdEDOUUszapuGvNQxPbgsX8V6wM34Kwnlj9lrdFkZQUphzL+dQuyMG+zHOjKzcd
P5AKG2OVlU7B02W/CdaF3rYr67PUXifrre92an7PFYcl3M8CcYx0qOx9tQnyDg9H
ZdH9Gpk7F8GOxRc43kWs6bgH8qoISXHF1mjE7gIS8Kpk0OtKmgxMRl2YvmUuXhH3
HcQM7h/eQL4kXYZvA0Ha5/ENfKePHrqWDHN/FKRfvLVpUNrBn+Hl6aBYcSWlpNgA
Jw+1Pf9omUroU1A/6znNpxT3AOb6xgTL+mpPfiy2b/5+cNoiZ+ybjw8TLoLGd0wW
RmIu8qxYcLjctSig0vjv0EN+GrQhEiPh7k+9HcnCLxUrgfw+sVU0PF84IqKtyjBi
BXb6hX69tWJaYlxGmyyjtbJhYcnNM8VwO0mK/dWBuQGNBGOa9GQBDAC2QNq/5pD3
5xd/Q24i51czXljT0PZSoNBbmk/w/gIpAHg6njs7MKWQK+zN/OeNCNQST4tCDut3
TxHy94IPKQswUuF8RLDKpGwt6ynHpKDHN2a6mIvZbljlnDdlktg6tCl8Tj7tNgil
4Vo+MyZRyMT2UbiUwl2HSKBe+UwjhMj1Zcr2hMV850AhJsEGAcSMvwCqb1yElExk
m8+LtzobWv19m36pjIvtjHUS5T+N1eukaYSca9MqOqbRwxBAkfz8LUqH5RgjFwwn
mObiy/MJ+mrYjopY5I7XNBN41kbrCRqfd+ftGedOaeil5vP4MFE8i+L9Nv71ZUh4
DZ8j5IzQfV8EL0FuMAtoCifViHVGtLAAHFW3d83AkqJF9NVDph27kXjp4WlXrutI
ki12ubBF6V/+lHBFclGEFM5GI0jmpTC7qvAwAcDnwHIl8KO0LLxwAxAbjPYT4apL
s+HJSP7PhM481vRyguOYNVantO+mK+/smHb6ok7232/6EcwY8/KuxscAEQEAAYkB
tgQYAQgAIBYhBOCHA24oA/jpgsa+paOQcV4AyGr2BQJjmvRkAhsMAAoJEKOQcV4A
yGr2QtML/jIRb7PRlbJkgpW58FgYJA/KNYaACxqhYItpgx6RvafPWRjvL8EK7gUS
YIaAG3rJU3E9y+PsPzt4GklHFmZwJTyWJb86/x4RvxyRv14Kh+p2R5Oi6O8uSP1L
W0DagC29P9PZq9ctbtV2rJR+3RYXxUV0VkaTCso02rEJMKuO9UlTVYO7Rslmomfj
uEeFMxLGlmSa+wY0fDKooheoWdz7lfELl1XcFA6YMR3cCvyaP7Znw0LFr/2PQUOE
5wa4QI6IMQNnuqHwz6ccpi7UAd7YJ67Pid6mCvZ9cjKXGnVrKud6uBVDYsBRtVrA
0fzJox7by+sQrxz560ZGd689Yr3t5JvB/I8mMwDGnXRMag2+3EzRD06lSgktM/tr
F91ISPUOQiJGG/GxTjclWcWo0jBb/B1p9gFHk5NE3UdMuRq2IOCVZN8NpjUAyGDI
Vrd2amdpVBXO1exqUaJB9kC/Pz9gYft8deJhXhCL+Mqy9Z9a5JNjYbFqBfJN3ZJe
4FaQ+FyWHQ==
=5JG1
-----END PGP PUBLIC KEY BLOCK-----
`;

const encryptFile = async ({ filePath, filePathEnc, logger, armorText }) => {
  console.log("🚀 ~ encryptFile ~ START:")
  // if ciphertext is wrtite file to storage and use new path if success remove file
  
  const ARG_ARMOR = armorText || ""; // --armor

  const publicKey = key;

  const outputFile = filePathEnc;

  console.log("🚀 ~ encryptFile ~ outputFile:", outputFile);
  try {
    if (!fs.existsSync("/tmp/gpg")) {
      fs.mkdirSync("/tmp/gpg");
    }
  } catch (err) {
    console.error(err);
  }

  const result = await new Promise((resolve, reject) => {
    try {
      gpg.importKey(publicKey, async (err, success, keyID) => {
        if (err) {
          console.log("Import Key Error ", err);
          return reject(err);
        }
        let keyName = keyID;
        if (success && (!keyID || keyID === "")) {
          const match = success.toString().match(/gpg: key (.*?):/);
          keyName = match && match[1];
        }
        console.log(
          `🚀 ~ file: encrypt ~ gpg.importKey ~ success: ${success} !!!!`
        );
        console.log("🚀 ~ file: encrypt ~ gpg.importKey ~ keyID:", keyID);
        console.log("🚀 ~ file: encrypt ~ gpg.importKey ~ keyName:", keyName);

        const args = [
          "--encrypt",
          "--default-key",
          keyName,
          "--recipient",
          keyName,
          "--trust-model",
          "always", // so we don't get "no assurance this key belongs to the given user"
        ];

        console.log(success);
        console.log({ filePath, outputFile });

        if (ARG_ARMOR) {
          args.push(ARG_ARMOR);
        }

        gpg.callStreaming(filePath, outputFile, args, async (e, s) => {
          // await fs.unlinkSync(filePath);
          resolve(outputFile);
          return outputFile;
        });
      });
    } catch (error) {
      (async () => {
        console.log("error====>", error);
        await fs.unlinkSync(filePath);
        await fs.unlinkSync(outputFile);
        reject(error);
      })();
    }
  });
  return result;
};

module.exports = { encryptFile };

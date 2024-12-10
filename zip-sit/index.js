const fs = require("fs");
const crypto = require("crypto");
const moment = require("moment");

const { encryptFile } = require("./src/encrypt");
const { uploadFileToS3 } = require("./src/s3");

const encryptShaFromStream = async (fileStream) => {
  return new Promise((resolve, reject) => {
    const txt = "createHash";
    const hash = crypto[txt](process.env.HASH_NAME || "sha256");
    fileStream.on("error", (err) => reject(err));
    fileStream.on("data", (chunk) => hash.update(chunk));
    fileStream.on("end", () => resolve(hash.digest("hex")));
  });
};

const readFileCheckSum = async (filePath) => {
  const fileContent = fs.createReadStream(filePath);
  return encryptShaFromStream(fileContent);
};

(async () => {
  console.time("All Process Time :");
  const fileDate = moment().format("YYYYMMDD");
  const listFolder = fs.readdirSync(`${__dirname}/input/`, {
    withFileTypes: true,
  });
  console.log("🚀 ~ listFolder:", listFolder);

  for await (const item of listFolder) {
    console.time(`${item.name} Time :`);
    const processPath = __dirname + "/process/";
    const filePath = item.path + item.name;
    const fileNameZip = item.name + ".enc";
    const filePathZip = processPath + fileNameZip;
    const encryptFilePath = await encryptFile({
      filePath,
      filePathEnc: filePathZip,
    });

    const ctrlFileName = "CTRL_" + item.name.replace(".zip", ".txt");
    const fileCtrlOutput = processPath + ctrlFileName;
    const checkSumFileResult = await readFileCheckSum(encryptFilePath);
    console.log('==== write file ====')
    fs.writeFileSync(
      fileCtrlOutput,
      `${fileNameZip}|0|${fileDate}|${checkSumFileResult}`,
      (err) => {
        console.log("error", err);
      }
    );

    const s3Bucket = "tcrb-debtacq-debtacquisition-nonprod";
    const s3PathFullOutbound = "inbound/edocument/edoc_tranfer_email/zip";
    if(['.DS_Store.enc', 'CTRL_.DS_Store'].includes(fileNameZip) || ['.DS_Store.enc', 'CTRL_.DS_Store'].includes(ctrlFileName)){

    }
    await uploadFileToS3({
      bucketName: s3Bucket,
      fileKey: `${s3PathFullOutbound}/${fileNameZip}`,
      filePath: encryptFilePath,
    });

    await uploadFileToS3({
      bucketName: s3Bucket,
      fileKey: `${s3PathFullOutbound}/${ctrlFileName}`,
      filePath: fileCtrlOutput,
    });
    console.timeEnd(`${item.name} Time :`);
  }
  console.timeEnd("All Process Time :");

})();

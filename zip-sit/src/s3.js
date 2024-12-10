const { S3Client, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, AbortMultipartUploadCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

const s3Client = new S3Client({});

const uploadFileToS3 = async ({ bucketName, fileKey, filePath }) => {
  console.log("🚀 ~ uploadFileToS3 ~ START:");
  console.log({ bucketName, fileKey, filePath });

  const fileSize = fs.statSync(filePath).size;
  const partSize = 1 * 1024 * 1024 * 1024; // 1 GB
  const totalParts = Math.ceil(fileSize / partSize);

  const fileStream = fs.createReadStream(filePath, { highWaterMark: partSize });

  try {
    // Step 1: Initiate Multipart Upload
    const createCommand = new CreateMultipartUploadCommand({
      Bucket: bucketName,
      Key: fileKey,
    });
    const { UploadId } = await s3Client.send(createCommand);

    console.log("🚀 ~ Multipart Upload Started ~ UploadId:", UploadId);

    // Step 2: Upload each part
    let partNumber = 1;
    const uploadPromises = [];
    const partBuffers = [];

    for await (const partBuffer of fileStream) {
      partBuffers.push(partBuffer);
      const uploadCommand = new UploadPartCommand({
        Bucket: bucketName,
        Key: fileKey,
        UploadId,
        PartNumber: partNumber,
        Body: partBuffer,
      });
      uploadPromises.push(s3Client.send(uploadCommand));
      console.log(`Uploading part ${partNumber}...`);
      partNumber++;
    }

    const partETags = (await Promise.all(uploadPromises)).map((response, index) => ({
      ETag: response.ETag,
      PartNumber: index + 1,
    }));

    // Step 3: Complete Multipart Upload
    const completeCommand = new CompleteMultipartUploadCommand({
      Bucket: bucketName,
      Key: fileKey,
      UploadId,
      MultipartUpload: {
        Parts: partETags,
      },
    });
    const completeResponse = await s3Client.send(completeCommand);
    console.log("🚀 ~ Upload Complete ~ Location:", completeResponse.Location);

    return completeResponse;
  } catch (err) {
    console.error("Error during upload:", err);

    // Abort Multipart Upload if an error occurs
    if (UploadId) {
      const abortCommand = new AbortMultipartUploadCommand({
        Bucket: bucketName,
        Key: fileKey,
        UploadId,
      });
      await s3Client.send(abortCommand);
      console.log("🚀 ~ Multipart Upload Aborted");
    }

    throw err;
  }
};

module.exports = { uploadFileToS3 };

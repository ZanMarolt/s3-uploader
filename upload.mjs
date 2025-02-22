import 'dotenv/config';
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import os from 'os';
import { fileTypeFromBuffer } from 'file-type';

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET,
    },
});

const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME;

async function copyToClipboard(text) {
    return new Promise((resolve, reject) => {
      const platform = os.platform();
  
      let command;
  
      if (platform === 'darwin') {
        // macOS
        command = 'pbcopy';
      } else if (platform === 'win32') {
        // Windows
        command = 'clip';
      } else {
        // Assume Linux and try xclip or xsel
        command = 'xclip -selection clipboard';
        // Alternatively, use xsel
        // command = 'xsel --clipboard --input';
      }
  
      const proc = exec(command, (error) => {
        if (error) {
          reject(error);
        }
      });
  
      proc.stdin.write(text);
      proc.stdin.end();
      proc.on('close', () => {
        resolve();
      });
    });
  }

async function uploadFileToS3(filePath) {
    try {
        // Read file data
        const fileData = await fs.readFile(filePath);
        
        // Detect file MIME type
        const fileType = await fileTypeFromBuffer(fileData);
        if (!fileType) {
            throw new Error("Unsupported file type or no file detected.");
        }

        // Use original filename or generate new one
        const originalFileName = path.basename(filePath);
        const key = `${Date.now()}-${originalFileName}`;

        const uploadParams = {
            Bucket: AWS_BUCKET_NAME,
            Key: key,
            Body: fileData,
            ContentType: fileType.mime,
        };

        console.log("Uploading file...");
        await s3Client.send(new PutObjectCommand(uploadParams));
        console.log("Upload successful");

        const urlParams = {
            Bucket: AWS_BUCKET_NAME,
            Key: key,
            Expires: 3600 * 24 * 30 * 10, // 300 days
        };

        const url = await getSignedUrl(s3Client, new GetObjectCommand(urlParams));
        return url;
    } catch (error) {
        console.error("Error uploading to S3:", error);
        throw error;
    }
}

// Get the file path from command-line arguments
const filePath = process.argv[2];
console.log(process.argv)
if (!filePath) {
    console.error("Please provide the file path as an argument.");
    process.exit(1);
}

uploadFileToS3(filePath)
    .then(url => {
        copyToClipboard(url);
        console.log("Url copied to clipboard");
    })
    .catch(error => {
        console.error("Upload failed:", error);
    });


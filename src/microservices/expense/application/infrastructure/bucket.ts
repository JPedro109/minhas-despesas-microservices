import { envs } from "@/shared";

import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export class Bucket {
    private readonly s3Client: S3Client;
    private readonly bucketName: string = envs.awsBucketName;

    constructor() {
        const credential = {
            accessKeyId: envs.awsAccessKeyId,
            secretAccessKey: envs.secretAccessKey,
        };
        this.s3Client = new S3Client({
            region: envs.awsRegion,
            credentials:
                envs.nodeEnv === "production" || envs.nodeEnv === "staging"
                    ? null
                    : credential,
            endpoint:
                envs.nodeEnv === "production" || envs.nodeEnv === "staging"
                    ? null
                    : envs.localstackEndpoint,
            forcePathStyle: envs.localstackEndpoint ? true : null,
        });
    }

    async uploadFile(fileName: string, fileContent: Buffer): Promise<string> {
        const putObjectCommand = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: fileName,
            Body: fileContent,
        });
        await this.s3Client.send(putObjectCommand);

        const getObjectCommand = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: fileName,
        });
        const url = await getSignedUrl(
            this.s3Client,
            getObjectCommand,
            { expiresIn: 5 * 24 * 60 * 60 }, // 5 days
        );

        return url;
    }
}

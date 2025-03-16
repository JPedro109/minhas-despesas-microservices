import { envs } from "@/shared";

import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

export class SQS {
    private readonly client: SQSClient;

    constructor() {
        const credential = {
            accessKeyId: envs.awsAccessKeyId,
            secretAccessKey: envs.secretAccessKey,
        };
        this.client = new SQSClient({
            region: envs.awsRegion,
            credentials:
                envs.nodeEnv === "production" || envs.nodeEnv === "staging"
                    ? null
                    : credential,
            endpoint:
                envs.nodeEnv === "production" || envs.nodeEnv === "staging"
                    ? null
                    : envs.localstackEndpoint,
        });
    }

    async sendMessage(queue: string, message: object): Promise<void> {
        const command = new SendMessageCommand({
            QueueUrl: queue,
            MessageBody: JSON.stringify(message),
        });
        await this.client.send(command);
    }
}

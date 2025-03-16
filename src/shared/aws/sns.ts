import { envs } from "@/shared";

import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

export class SNS {
    private readonly client: SNSClient;

    constructor() {
        const credential = {
            accessKeyId: envs.awsAccessKeyId,
            secretAccessKey: envs.secretAccessKey,
        };

        this.client = new SNSClient({
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

    async publish(topic: string, message: object): Promise<void> {
        const command = new PublishCommand({
            TopicArn: topic,
            Message: JSON.stringify(message),
        });
        await this.client.send(command);
    }
}

import { envs, SNS } from "@/shared";

export class Notification {
    constructor(private readonly notification: SNS) {}

    async sendEvent(message: object): Promise<void> {
        await this.notification.publish(envs.eventTopic, message);
    }
}

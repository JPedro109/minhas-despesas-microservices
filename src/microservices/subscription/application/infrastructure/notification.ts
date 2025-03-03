import { envs, SNS, SQS } from "@/shared";

export enum EmailTemplateEnum {
    NotifySubscriptionPaymentFailureTemplate = "notify-subscription-payment-failure-template",
}

export class Notification {
    constructor(
        private readonly queue: SQS,
        private readonly notification: SNS,
    ) {}

    async sendEmail(
        to: string,
        template: EmailTemplateEnum,
        props?: object,
    ): Promise<void> {
        const email = {
            to,
            template,
            props,
            service: "MINHAS_DESPESAS",
        };

        await this.queue.sendMessage(envs.sendEmailQueue, {
            pattern: "send_email",
            data: email,
        });
    }

    async sendEvent(message: object): Promise<void> {
        await this.notification.publish(envs.eventTopic, message);
    }
}

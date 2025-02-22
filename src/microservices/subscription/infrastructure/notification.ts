import { envs, SQS } from "@/shared";

export enum EmailTemplateEnum {
    NotifySubscriptionPaymentFailureTemplate = "notify-subscription-payment-failure-template",
}

export class Notification {
    constructor(private readonly queue: SQS) {}

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
}

import { envs } from "@/shared";

import path from "node:path";
import fs from "node:fs";

import handlebars from "handlebars";
import juice from "juice";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { SQSEvent } from "aws-lambda";

type SendEmailDTO = {
    to: string;
    body: string;
    props?: Record<string, string>;
};

export const handler = async (event: SQSEvent): Promise<void> => {
    for (const message of event.Records) {
        const credentials = {
            accessKeyId: envs.awsAccessKeyId,
            secretAccessKey: envs.secretAccessKey,
        };
        const sesClient = new SESClient({
            credentials: envs.nodeEnv === "production" ? null : credentials,
            region: envs.awsRegion,
        });

        const { data } = JSON.parse(message.body);

        const { to, body, props }: SendEmailDTO = data;

        const htmlBuffer = fs.readFileSync(
            path.resolve(__dirname, `./templates/${body}.html`),
        );
        const cssBuffer = fs.readFileSync(
            path.resolve(__dirname, "./templates/styles/main.css"),
        );
        const template = handlebars.compile(htmlBuffer.toString());
        const html = template(props);
        const inlinedHtml = juice.inlineContent(html, cssBuffer.toString());

        const templates = {
            "notify-subscription-payment-failure-template": {
                subject: "Notificação de Falha de Renovação da assinatura",
            },
            "recovery-user-password-body": {
                subject: "Recuperação de Senha",
            },
            "update-user-email-body": {
                subject: "Atualização de E-mail",
            },
            "verify-user-email-body": {
                subject: "Verificação de E-mail",
            },
        };
        const subject = templates[body]?.subject;
        if (!subject) {
            throw new Error("Esse corpo de e-mail não existe");
        }

        const command = new SendEmailCommand({
            Source: envs.awsSESSourceEmail,
            Destination: {
                ToAddresses: [to],
            },
            Message: {
                Subject: {
                    Data: subject,
                },
                Body: {
                    Html: {
                        Data: inlinedHtml,
                    },
                },
            },
        });
        await sesClient.send(command);
    }
};

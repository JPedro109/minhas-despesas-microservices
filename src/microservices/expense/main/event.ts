import {
    createAccountService,
    createSubscriptionService,
    deleteAccountService,
    updateAccountEmailService,
} from "../application";

import { SQSEvent } from "aws-lambda";

export const events = async (event: SQSEvent): Promise<void> => {
    for (const record of event.Records) {
        const notificationBody = JSON.parse(record.body);
        const messageBody = JSON.parse(notificationBody.Message);

        const event = messageBody.event;
        const data = messageBody.data;

        switch (event) {
            case "create:account":
                await createAccountService.execute(data);
                break;

            case "update:account-email":
                await updateAccountEmailService.execute(data);
                break;

            case "delete:account":
                await deleteAccountService.execute(data);
                break;

            case "create:subscription":
                await createSubscriptionService.execute(data);
                break;
        }
    }
};

import {
    CreateAccountService,
    CreateSubscriptionService,
    DeleteAccountService,
    UpdateAccountEmailService,
} from "../services";
import { accountDAO, subscriptionDAO } from "../factories";

import { SQSEvent } from "aws-lambda";

export const events = async (event: SQSEvent): Promise<void> => {
    for (const record of event.Records) {
        const notificationBody = JSON.parse(record.body);
        const messageBody = JSON.parse(notificationBody.Message);

        const event = messageBody.event;
        const data = messageBody.data;

        switch (event) {
            case "create:account":
                await new CreateAccountService(accountDAO).execute(data);
                break;

            case "update:account-email":
                await new UpdateAccountEmailService(accountDAO).execute(data);
                break;

            case "delete:account":
                await new DeleteAccountService(accountDAO).execute(data);
                break;

            case "create:subscription":
                await new CreateSubscriptionService(subscriptionDAO).execute(
                    data,
                );
                break;
        }
    }
};

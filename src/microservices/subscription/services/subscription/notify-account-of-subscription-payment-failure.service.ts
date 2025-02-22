import { NotFoundError, RequestSchema } from "@/shared";
import {
    AccountDAO,
    CustomerDAO,
    EmailTemplateEnum,
    Notification,
} from "../../infrastructure";

export type NotifyAccountOfSubscriptionPaymentFailureDTO = {
    customerId: string;
};

export const notifyAccountOfSubscriptionPaymentFailureSchema: RequestSchema = {
    customerId: {
        type: "string",
        optional: false,
    },
};

export class NotifyAccountOfSubscriptionPaymentFailureService {
    constructor(
        private readonly customerDAO: CustomerDAO,
        private readonly accountDAO: AccountDAO,
        private readonly notification: Notification,
    ) {}

    async execute({
        customerId,
    }: NotifyAccountOfSubscriptionPaymentFailureDTO): Promise<void> {
        const customer = await this.customerDAO.getCustomerById(customerId);

        if (!customer) {
            throw new NotFoundError("O cliente não existe");
        }

        const account = await this.accountDAO.getAccountById(
            customer.accountId,
        );

        await this.notification.sendEmail(
            account.email,
            EmailTemplateEnum.NotifySubscriptionPaymentFailureTemplate,
        );
    }
}

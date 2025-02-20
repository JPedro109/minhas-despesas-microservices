import { NotFoundError } from "@/shared";
import {
    AccountDAO,
    CustomerDAO,
    EmailTemplateEnum,
    Notification,
} from "../../infrastructure";

export type NotifyUserOfSubscriptionPaymentFailureDTO = {
    customerId: string;
};

export class NotifyUserOfSubscriptionPaymentFailureUseCase {
    constructor(
        private readonly customerDAO: CustomerDAO,
        private readonly accountDAO: AccountDAO,
        private readonly notification: Notification,
    ) {}

    async execute({
        customerId,
    }: NotifyUserOfSubscriptionPaymentFailureDTO): Promise<void> {
        const customer = await this.customerDAO.getCustomerById(customerId);

        if (!customer) {
            throw new NotFoundError("O cliente não existe não existe");
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

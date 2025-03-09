import { NotFoundError, RequestSchema } from "@/shared";
import { PaymentMethodDAO, CustomerDAO, Payment } from "../../infrastructure";

export type UpdatePaymentMethodTokenDTO = {
    accountId: string;
    token: string;
};

export const updatePaymentMethodTokenSchema: RequestSchema = {
    accountId: {
        type: "string",
        optional: false,
    },
    token: {
        type: "string",
        optional: false,
    },
};

export class UpdatePaymentMethodTokenService {
    constructor(
        private readonly paymentMethodDAO: PaymentMethodDAO,
        private readonly customerDAO: CustomerDAO,
        private readonly payment: Payment,
    ) {}

    async execute({
        accountId,
        token,
    }: UpdatePaymentMethodTokenDTO): Promise<void> {
        const paymentMethod =
            await this.paymentMethodDAO.getPaymentMethodByAccountId(accountId);
        if (!paymentMethod) {
            throw new NotFoundError("Esse método de pagamento não existe");
        }
        const oldToken = paymentMethod.token;

        const customer =
            await this.customerDAO.getCustomerByAccountId(accountId);
        const tokenCreated =
            await this.payment.attachmentPaymentMethodInCustomer(
                customer.customerExternalId,
                token,
            );

        paymentMethod.token = tokenCreated;
        await this.paymentMethodDAO.updatePaymentMethodByAccountIdAndPaymentMethodId(
            paymentMethod.accountId,
            paymentMethod.paymentMethodId,
            paymentMethod,
        );

        try {
            await this.payment.detachmentPaymentMethodInCustomerByToken(
                oldToken,
            );
            await this.payment.payExpiredSubscriptionIfAny(
                customer.customerExternalId,
                tokenCreated,
            );
        } catch (e) {
            paymentMethod.token = oldToken;
            await this.paymentMethodDAO.updatePaymentMethodByAccountIdAndPaymentMethodId(
                paymentMethod.accountId,
                paymentMethod.paymentMethodId,
                paymentMethod,
            );
            await this.payment.detachmentPaymentMethodInCustomerByToken(
                tokenCreated,
            );
            throw e;
        }
    }
}

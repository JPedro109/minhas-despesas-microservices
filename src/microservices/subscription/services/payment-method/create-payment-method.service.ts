import { ConflictedError, NotFoundError, RequestSchema, Utils } from "@/shared";
import {
    AccountDAO,
    CustomerDAO,
    PaymentMethodDAO,
    PaymentMethodModel,
    Payment,
} from "../../infrastructure";

export type CreatePaymentMethodDTO = {
    accountId: string;
    name: string;
    token: string;
};

export const createPaymentMethodSchema: RequestSchema = {
    accountId: {
        type: "string",
        optional: false,
    },
    name: {
        type: "string",
        optional: false,
    },
    token: {
        type: "string",
        optional: false,
    },
};

export class CreatePaymentMethodService {
    constructor(
        private readonly accountDAO: AccountDAO,
        private readonly customerDAO: CustomerDAO,
        private readonly paymentMethodDAO: PaymentMethodDAO,
        private readonly payment: Payment,
    ) {}

    async execute({
        accountId,
        name,
        token,
    }: CreatePaymentMethodDTO): Promise<string> {
        const accountExists = await this.accountDAO.getAccountById(accountId);
        if (!accountExists) throw new NotFoundError("Essa conta não existe");

        const paymentMethodExists =
            await this.paymentMethodDAO.getPaymentMethodByAccountId(accountId);
        if (paymentMethodExists) {
            throw new ConflictedError(
                "Já existe um método de pagamento para essa conta",
            );
        }

        let paymentMethodCreated: PaymentMethodModel | undefined;
        const customer =
            await this.customerDAO.getCustomerByAccountId(accountId);
        const tokenCreated =
            await this.payment.attachmentPaymentMethodInCustomer(
                customer.customerId,
                token,
            );
        try {
            paymentMethodCreated =
                await this.paymentMethodDAO.createPaymentMethod({
                    accountId,
                    paymentMethodId: Utils.createUUID(),
                    name,
                    token,
                });
            await this.payment.payExpiredSubscriptionIfAny(
                customer.customerId,
                tokenCreated,
            );
        } catch (e) {
            if (paymentMethodCreated) {
                await this.paymentMethodDAO.deletePaymentMethodByAccountIdAndPaymentMethodId(
                    accountId,
                    paymentMethodCreated.paymentMethodId,
                );
            }
            await this.payment.detachmentPaymentMethodInCustomerByToken(
                tokenCreated,
            );
            throw e;
        }

        return paymentMethodCreated.paymentMethodId;
    }
}

import { ForbiddenError, NotFoundError, RequestSchema } from "@/shared";
import {
    Payment,
    PaymentMethodDAO,
    SubscriptionDAO,
} from "../../infrastructure";

export type DeletePaymentMethodDTO = {
    accountId: string;
};

export const deletePaymentMethodSchema: RequestSchema = {
    accountId: {
        type: "string",
        optional: false,
    },
};

export class DeletePaymentMethodService {
    constructor(
        private readonly paymentMethodDAO: PaymentMethodDAO,
        private readonly subscriptionDAO: SubscriptionDAO,
        private readonly payment: Payment,
    ) {}

    async execute({ accountId }: DeletePaymentMethodDTO): Promise<void> {
        const paymentMethod =
            await this.paymentMethodDAO.getPaymentMethodByAccountId(accountId);
        if (!paymentMethod) {
            throw new NotFoundError("Esse método de pagamento não existe");
        }

        const subscription =
            await this.subscriptionDAO.getSubscriptionByAccountId(
                paymentMethod.accountId,
            );

        if (subscription) {
            const subscriptionData =
                await this.payment.getSubscriptionBySubscriptionExternalId(
                    subscription.subscriptionExternalId,
                );

            if (subscriptionData.renewable) {
                throw new ForbiddenError(
                    "Não possível excluir o método de pagamento pois existe uma assinatura ativa, cancele a assinatura para excluir o método de pagamento",
                );
            }
        }

        try {
            await this.paymentMethodDAO.deletePaymentMethodByAccountIdAndPaymentMethodId(
                paymentMethod.accountId,
                paymentMethod.paymentMethodId,
            );
            await this.payment.detachmentPaymentMethodInCustomerByToken(
                paymentMethod.token,
            );
        } catch (e) {
            const paymentMethodExists =
                await this.paymentMethodDAO.getPaymentMethodByAccountId(
                    accountId,
                );

            if (!paymentMethodExists) {
                await this.paymentMethodDAO.createPaymentMethod(paymentMethod);
            }

            throw e;
        }
    }
}

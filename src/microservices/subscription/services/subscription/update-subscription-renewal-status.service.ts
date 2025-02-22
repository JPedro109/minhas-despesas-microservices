import { ForbiddenError, NotFoundError, RequestSchema } from "@/shared";
import {
    Payment,
    PaymentMethodDAO,
    SubscriptionDAO,
} from "../../infrastructure";

export type UpdateSubscriptionRenewalStatusDTO = {
    accountId: string;
    renewable: boolean;
};

export const updateSubscriptionRenewalSchema: RequestSchema = {
    accountId: {
        type: "string",
        optional: false,
    },
    renewable: {
        type: "boolean",
        optional: false,
    },
};

export class UpdateSubscriptionRenewalStatusService {
    constructor(
        private readonly subscriptionDAO: SubscriptionDAO,
        private readonly paymentMethodDAO: PaymentMethodDAO,
        private readonly payment: Payment,
    ) {}

    async execute({
        accountId,
        renewable,
    }: UpdateSubscriptionRenewalStatusDTO): Promise<void> {
        const subscription =
            await this.subscriptionDAO.getSubscriptionByAccountId(accountId);

        if (!subscription) {
            throw new NotFoundError("A conta não tem uma assinatura");
        }

        if (renewable) {
            const paymentMethodExists =
                await this.paymentMethodDAO.getPaymentMethodByAccountId(
                    accountId,
                );
            if (!paymentMethodExists)
                throw new ForbiddenError(
                    "Para ativar a renovação da assinatura é necessário adicionar um método de pagamento",
                );
        }

        const subscriptionData =
            await this.payment.getSubscriptionBySubscriptionExternalId(
                subscription.subscriptionExternalId,
            );

        if (subscriptionData.renewable === renewable)
            throw new ForbiddenError(
                `A assinatura já está ${renewable ? "ativa" : "cancelada"}`,
            );

        await this.payment.updateSubscriptionRenewable(
            subscription.subscriptionExternalId,
            renewable,
        );
    }
}

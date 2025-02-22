import { NotFoundError, RequestSchema, Utils } from "@/shared";
import {
    CustomerDAO,
    Payment,
    PaymentMethodDAO,
    PlanDAO,
    SubscriptionDAO,
} from "../../infrastructure";

export type CreateSubscriptionDTO = {
    accountId: string;
    planId: string;
};

export const createSubscriptionSchema: RequestSchema = {
    accountId: {
        type: "string",
        optional: false,
    },
    planId: {
        type: "string",
        optional: false,
    },
};

export class CreateSubscriptionService {
    constructor(
        private readonly customerDAO: CustomerDAO,
        private readonly paymentMethodDAO: PaymentMethodDAO,
        private readonly planDAO: PlanDAO,
        private readonly subscriptionDAO: SubscriptionDAO,
        private readonly payment: Payment,
    ) {}

    async execute({
        accountId,
        planId,
    }: CreateSubscriptionDTO): Promise<string> {
        const customer =
            await this.customerDAO.getCustomerByAccountId(accountId);
        if (!customer) throw new NotFoundError("O cliente não existe");

        const paymentMethod =
            await this.paymentMethodDAO.getPaymentMethodByAccountId(accountId);
        if (!paymentMethod)
            throw new NotFoundError("O método de pagamento não existe");

        const plan = await this.planDAO.getPlanById(planId);
        if (!plan) throw new NotFoundError("O plano não existe");

        const subscriptionExternalId = await this.payment.createSubscription(
            customer.customerExternalId,
            plan.planExternalId,
            paymentMethod.token,
        );

        try {
            const subscription = await this.subscriptionDAO.createSubscription({
                subscriptionId: Utils.createUUID(),
                accountId,
                subscriptionExternalId,
                planId,
            });
            return subscription.subscriptionId;
        } catch (e) {
            await this.payment.deleteSubscription(subscriptionExternalId);
            throw e;
        }
    }
}

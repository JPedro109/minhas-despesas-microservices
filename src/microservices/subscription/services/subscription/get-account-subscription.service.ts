import { NotFoundError, RequestSchema } from "@/shared";
import {
    AccountDAO,
    PlanDAO,
    SubscriptionDAO,
    Payment,
} from "../../infrastructure";

export type GetAccountSubscriptionDTO = {
    accountId: string;
};

export type GetAccountSubscriptionResponseDTO = {
    subscriptionId: string;
    accountId: string;
    plan: {
        planId: string;
        name: string;
        amount: number;
        description: string;
        durationInDays: number;
    };
    active: boolean;
    renewable: boolean;
    startDate: Date;
    endDate?: Date;
};

export const getAccountSubscriptionSchema: RequestSchema = {
    accountId: {
        type: "string",
        optional: false,
    },
};

export class GetAccountSubscriptionService {
    constructor(
        private readonly accountDAO: AccountDAO,
        private readonly subscriptionDAO: SubscriptionDAO,
        private readonly planDAO: PlanDAO,
        private readonly payment: Payment,
    ) {}

    async execute({
        accountId,
    }: GetAccountSubscriptionDTO): Promise<GetAccountSubscriptionResponseDTO> {
        const accountExists = await this.accountDAO.getAccountById(accountId);
        if (!accountExists) {
            throw new NotFoundError("A conta não existe");
        }

        const subscription =
            await this.subscriptionDAO.getSubscriptionByAccountId(accountId);
        if (!subscription) {
            throw new NotFoundError("A conta não tem uma assinatura");
        }

        const subscriptionData =
            await this.payment.getSubscriptionBySubscriptionExternalId(
                subscription.subscriptionExternalId,
            );

        const plan = await this.planDAO.getPlanById(subscription.planId);

        return {
            subscriptionId: subscription.subscriptionId,
            accountId: subscription.accountId,
            active: subscriptionData.active,
            renewable: subscriptionData.renewable,
            startDate: subscriptionData.startDate,
            endDate: subscriptionData.endDate,
            plan: {
                planId: plan.planId,
                name: plan.name,
                amount: plan.amount,
                description: plan.description,
                durationInDays: plan.durationInDays,
            },
        };
    }
}

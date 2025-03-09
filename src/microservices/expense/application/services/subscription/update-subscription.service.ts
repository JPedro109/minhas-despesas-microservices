import { NotFoundError, RequestSchema } from "@/shared";
import { SubscriptionDAO } from "../../infrastructure";

export type UpdateSubscriptionDTO = {
    accountId: string;
    active: boolean;
};

export const updateSubscriptionRenewalSchema: RequestSchema = {
    accountId: {
        type: "string",
        optional: false,
    },
    active: {
        type: "boolean",
        optional: false,
    },
};

export class UpdateSubscriptionService {
    constructor(private readonly subscriptionDAO: SubscriptionDAO) {}

    async execute({ accountId, active }: UpdateSubscriptionDTO): Promise<void> {
        const subscription =
            await this.subscriptionDAO.getSubscriptionByAccountId(accountId);

        if (!subscription) {
            throw new NotFoundError("A conta não tem uma assinatura");
        }

        subscription.active = active;

        await this.subscriptionDAO.updateSubscriptionByAccountIdAndSubscriptionId(
            accountId,
            subscription.subscriptionId,
            subscription,
        );
    }
}

import { RequestSchema } from "@/shared";
import { SubscriptionDAO } from "../../infrastructure";

export type CreateSubscriptionDTO = {
    accountId: string;
    subscriptionId: string;
    active: boolean;
};

export const createSubscriptionSchema: RequestSchema = {
    accountId: {
        type: "string",
        optional: false,
    },
    subscriptionId: {
        type: "string",
        optional: false,
    },
    active: {
        type: "boolean",
        optional: false,
    },
};

export class CreateSubscriptionService {
    constructor(private readonly subscriptionDAO: SubscriptionDAO) {}

    async execute({
        accountId,
        subscriptionId,
        active,
    }: CreateSubscriptionDTO): Promise<string> {
        const subscription = await this.subscriptionDAO.createSubscription({
            subscriptionId,
            accountId,
            active,
        });
        return subscription.subscriptionId;
    }
}

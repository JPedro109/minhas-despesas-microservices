import { Dynamo } from "@/shared";

export type SubscriptionDynamoModel = {
    AccountId: string;
    SubscriptionId: string;
    SubscriptionExternalId: string;
    CreatedAt: Date;
};

export type SubscriptionModel = {
    accountId: string;
    subscriptionId: string;
    subscriptionExternalId: string;
    createdAt: Date;
};

export class SubscriptionDAO {
    private readonly fatherEntity: string = "Account";
    static entity: string = "Subscription";

    constructor(private readonly dynamo: Dynamo) {}

    async createSubscription(
        data: Omit<SubscriptionModel, "createdAt">,
    ): Promise<SubscriptionModel> {
        await this.dynamo.create(
            `${this.fatherEntity}#${data.accountId}`,
            `${SubscriptionDAO.entity}#${data.accountId}`,
            {
                Type: SubscriptionDAO.entity,
                AccountId: data.accountId,
                SubscriptionId: data.subscriptionId,
                SubscriptionExternalId: data.subscriptionExternalId,
                CreatedAt: new Date().toISOString(),
            },
        );

        return await this.getSubscriptionByAccountId(data.accountId);
    }

    async getSubscriptionByAccountId(
        accountId: string,
    ): Promise<SubscriptionModel | null> {
        const item = await this.dynamo.get<SubscriptionDynamoModel>(
            `${this.fatherEntity}#${accountId}`,
            `${SubscriptionDAO.entity}#`,
            {
                skBeginsWith: true,
            },
        );

        if (!item.length) return null;

        return {
            accountId: item[0].AccountId,
            subscriptionId: item[0].SubscriptionId,
            subscriptionExternalId: item[0].SubscriptionExternalId,
            createdAt: item[0].CreatedAt,
        };
    }
}

import { Dynamo } from "@/shared";

export type SubscriptionDynamoModel = {
    AccountId: string;
    SubscriptionId: string;
    Active: boolean;
    CreatedAt: Date;
    UpdatedAt: Date;
};

export type SubscriptionModel = {
    accountId: string;
    subscriptionId: string;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
};

export class SubscriptionDAO {
    private readonly fatherEntity: string = "Account";
    static entity: string = "Subscription";

    constructor(private readonly dynamo: Dynamo) {}

    async createSubscription(
        data: Omit<SubscriptionModel, "createdAt" | "updatedAt">,
    ): Promise<SubscriptionModel> {
        await this.dynamo.create(
            `${this.fatherEntity}#${data.accountId}`,
            `${SubscriptionDAO.entity}#${data.subscriptionId}`,
            {
                Type: SubscriptionDAO.entity,
                AccountId: data.accountId,
                SubscriptionId: data.subscriptionId,
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
            active: item[0].Active,
            createdAt: item[0].CreatedAt,
            updatedAt: item[0].UpdatedAt,
        };
    }

    async updateSubscriptionByAccountIdAndSubscriptionId(
        accountId: string,
        subscriptionId: string,
        data: SubscriptionModel,
    ): Promise<void> {
        await this.dynamo.updateOne(
            `${this.fatherEntity}#${accountId}`,
            `${SubscriptionDAO.entity}#${subscriptionId}`,
            {
                Active: data.active,
                UpdatedAt: new Date().toISOString(),
            },
        );
    }
}

import { Dynamo } from "@/shared";
import { AccountDAO } from "./account.dao";

export type CustomerDynamoModel = {
    AccountId: string;
    CustomerId: string;
    CustomerExternalId: string;
    CreatedAt: Date;
};

export type CustomerModel = {
    accountId: string;
    customerId: string;
    customerExternalId: string;
    createdAt: Date;
};

export class CustomerDAO {
    private readonly fatherEntity: string = AccountDAO.entity;
    static entity: string = "Customer";

    constructor(private readonly dynamo: Dynamo) {}

    async createCustomer(
        data: Omit<CustomerModel, "createdAt">,
    ): Promise<CustomerModel> {
        await this.dynamo.create(
            `${this.fatherEntity}#${data.accountId}`,
            `${CustomerDAO.entity}#${data.customerId}`,
            {
                Type: CustomerDAO.entity,
                AccountId: data.accountId,
                CustomerId: data.customerId,
                CustomerExternalId: data.customerExternalId,
                CreatedAt: new Date().toISOString(),
                GSI1PK: `${CustomerDAO.entity}#${data.accountId}`,
                GSI1SK: "DETAILS",
            },
        );

        return await this.getCustomerByAccountId(data.accountId);
    }

    async getCustomerByAccountId(
        accountId: string,
    ): Promise<CustomerModel | null> {
        const item = await this.dynamo.get<CustomerDynamoModel>(
            `${this.fatherEntity}#${accountId}`,
            `${CustomerDAO.entity}#`,
            {
                skBeginsWith: true,
            },
        );

        if (!item.length) return null;

        return {
            accountId: item[0].AccountId,
            customerId: item[0].CustomerId,
            customerExternalId: item[0].CustomerExternalId,
            createdAt: new Date(item[0].CreatedAt),
        };
    }

    async getCustomerById(customerId: string): Promise<CustomerModel | null> {
        const item = await this.dynamo.get<CustomerDynamoModel>(
            `${CustomerDAO.entity}#${customerId}`,
            "DETAILS",
            {
                indexName: "GSI1",
            },
        );

        if (!item.length) return null;

        return {
            accountId: item[0].AccountId,
            customerId: item[0].CustomerId,
            customerExternalId: item[0].CustomerExternalId,
            createdAt: new Date(item[0].CreatedAt),
        };
    }
}

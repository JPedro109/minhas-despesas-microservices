import { Dynamo } from "@/shared";

export type CustomerDynamoModel = {
    AccountId: string;
    CustomerId: string;
    CreatedAt: Date;
};

export type CustomerModel = {
    accountId: string;
    customerId: string;
    createdAt: Date;
};

export class CustomerDAO {
    private readonly fatherEntity: string = "Account";
    static entity: string = "Customer";

    constructor(private readonly dynamo: Dynamo) {}

    async createCustomer(
        data: Omit<CustomerModel, "createdAt">,
    ): Promise<CustomerModel> {
        await this.dynamo.create(
            `${this.fatherEntity}#${data.accountId}`,
            `${CustomerDAO.entity}#${data.accountId}`,
            {
                Type: CustomerDAO.entity,
                AccountId: data.accountId,
                CustomerId: data.customerId,
                CreatedAt: new Date().toISOString(),
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
            createdAt: item[0].CreatedAt,
        };
    }
}

import { Dynamo } from "@/shared";

export type AccountDynamoModel = {
    AccountId: string;
    CreatedAt: Date;
};

export type AccountModel = {
    accountId: string;
    createdAt: Date;
};

export class AccountDAO {
    static entity: string = "Account";

    constructor(private readonly dynamo: Dynamo) {}

    async createAccount(
        data: Omit<AccountModel, "createdAt">,
    ): Promise<AccountModel> {
        await this.dynamo.create(
            `${AccountDAO.entity}#${data.accountId}`,
            `${AccountDAO.entity}#${data.accountId}`,
            {
                Type: AccountDAO.entity,
                AccountId: data.accountId,
                CreatedAt: new Date().toISOString(),
            },
        );

        return await this.getAccountById(data.accountId);
    }

    async getAccountById(accountId: string): Promise<AccountModel | null> {
        const item = await this.dynamo.getOne<AccountDynamoModel>(
            `${AccountDAO.entity}#${accountId}`,
            `${AccountDAO.entity}#${accountId}`,
        );

        if (!item) return null;

        return {
            accountId: item.AccountId,
            createdAt: new Date(item.CreatedAt),
        };
    }

    async deleteAccountById(accountId: string): Promise<void> {
        await this.dynamo.deletePartion(`${AccountDAO.entity}#${accountId}`);
    }
}

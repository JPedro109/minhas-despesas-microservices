import { Dynamo } from "@/shared";

export type AccountDynamoModel = {
    AccountId: string;
    Email: string;
    CreatedAt: Date;
    UpdatedAt: Date;
};

export type AccountModel = {
    accountId: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
};

export class AccountDAO {
    static entity: string = "Account";

    constructor(private readonly dynamo: Dynamo) {}

    async createAccount(
        data: Omit<AccountModel, "createdAt" | "updatedAt">,
    ): Promise<AccountModel> {
        await this.dynamo.create(
            `${AccountDAO.entity}#${data.accountId}`,
            `${AccountDAO.entity}#${data.accountId}`,
            {
                Type: AccountDAO.entity,
                AccountId: data.accountId,
                Email: data.email,
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
            email: item.Email,
            createdAt: new Date(item.CreatedAt),
            updatedAt: item.UpdatedAt ? new Date(item.UpdatedAt) : null,
        };
    }

    async updateAccountById(
        accountId: string,
        data: AccountModel,
    ): Promise<void> {
        await this.dynamo.updateOne(
            `${AccountDAO.entity}#${accountId}`,
            `${AccountDAO.entity}#${accountId}`,
            {
                Email: data.email,
                UpdatedAt: new Date().toISOString(),
            },
        );
    }

    async deleteAccountById(accountId: string): Promise<void> {
        await this.dynamo.deletePartion(`${AccountDAO.entity}#${accountId}`);
    }
}

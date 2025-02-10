import { Dynamo } from "@/shared";

export type AccountDynamoModel = {
    AccountId: string;
    IdentityProviderId: string;
    CreatedAt: Date;
    UpdatedAt?: Date;
};

export type AccountModel = {
    accountId: string;
    identityProviderId: string;
    createdAt: Date;
    updatedAt?: Date;
};

export class AccountDAO {
    private readonly entity: string = "Account";
    constructor(private readonly dynamo: Dynamo) {}

    async createAccount(data: AccountModel): Promise<AccountModel> {
        await this.dynamo.create(
            `${this.entity}#${data.accountId}`,
            `${this.entity}#${data.accountId}`,
            {
                Type: this.entity,
                AccountId: data.accountId,
                IdentityProviderId: data.identityProviderId,
                CreatedAt: new Date().toISOString(),
            },
        );

        return await this.getAccountById(data.accountId);
    }

    async getAccountById(accountId: string): Promise<AccountModel | null> {
        const item = await this.dynamo.getOne<AccountDynamoModel>(
            `${this.entity}#${accountId}`,
            `${this.entity}#${accountId}`,
        );

        if (!item) return null;

        return {
            accountId: item.AccountId,
            identityProviderId: item.IdentityProviderId,
            createdAt: item.CreatedAt,
            updatedAt: item.UpdatedAt,
        };
    }

    async deleteAccountById(accountId: string): Promise<void> {
        await this.dynamo.deleteOne(
            `${this.entity}#${accountId}`,
            `${this.entity}#${accountId}`,
        );
    }
}

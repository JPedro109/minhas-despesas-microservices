import { Dynamo, Utils } from "@/shared";

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
    static entity: string = "Account";

    constructor(private readonly dynamo: Dynamo) {}

    async createAccount(
        data: Omit<AccountModel, "accountId">,
    ): Promise<AccountModel> {
        const accountId = Utils.createUUID();

        await this.dynamo.create(
            `${AccountDAO.entity}#${accountId}`,
            `${AccountDAO.entity}#${accountId}`,
            {
                Type: AccountDAO.entity,
                AccountId: accountId,
                IdentityProviderId: data.identityProviderId,
                CreatedAt: new Date().toISOString(),
            },
        );

        return await this.getAccountById(accountId);
    }

    async getAccountById(accountId: string): Promise<AccountModel | null> {
        const item = await this.dynamo.getOne<AccountDynamoModel>(
            `${AccountDAO.entity}#${accountId}`,
            `${AccountDAO.entity}#${accountId}`,
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
            `${AccountDAO.entity}#${accountId}`,
            `${AccountDAO.entity}#${accountId}`,
        );
    }
}

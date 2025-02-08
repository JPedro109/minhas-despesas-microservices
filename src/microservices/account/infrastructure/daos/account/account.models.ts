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

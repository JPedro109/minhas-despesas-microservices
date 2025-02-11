import { Dynamo, Utils } from "@/shared";
import { AccountDAO } from "./account.dao";

export type AccountConsentDynamoModel = {
    AccountConsentId: string;
    AccountId: string;
    ConsentVersion: string;
    IpAddress: string;
    UserAgent: string;
    CreatedAt: Date;
};

export type AccountConsentModel = {
    accountConsentId: string;
    accountId: string;
    consentVersion: string;
    ipAddress: string;
    userAgent: string;
    createdAt: Date;
};

export class AccountConsentDAO {
    private readonly fatherEntity: string = AccountDAO.entity;
    static entity: string = "AccountConsent";

    constructor(private readonly dynamo: Dynamo) {}

    async createAccount(
        data: Omit<AccountConsentModel, "accountConsentId">,
    ): Promise<AccountConsentModel> {
        const accountConsentId = Utils.createUUID();

        await this.dynamo.create(
            `${this.fatherEntity}#${data.accountId}`,
            `${AccountConsentDAO.entity}#${accountConsentId}`,
            {
                Type: AccountConsentDAO.entity,
                AccountId: data.accountId,
                AccountConsentId: accountConsentId,
                ConsentVersion: data.consentVersion,
                IpAddress: data.ipAddress,
                UserAgent: data.userAgent,
                CreatedAt: new Date().toISOString(),
            },
        );

        return await this.getAccountConsentByAccountId(data.accountId);
    }

    async getAccountConsentByAccountId(
        accountId: string,
    ): Promise<AccountConsentModel | null> {
        const item = await this.dynamo.get<AccountConsentDynamoModel>(
            `${this.fatherEntity}#${accountId}`,
            `${AccountConsentDAO.entity}#`,
            { skBeginsWith: true },
        );

        if (!item) return null;

        return {
            accountId: item[0].AccountId,
            accountConsentId: item[0].AccountConsentId,
            consentVersion: item[0].ConsentVersion,
            ipAddress: item[0].IpAddress,
            userAgent: item[0].UserAgent,
            createdAt: item[0].CreatedAt,
        };
    }
}

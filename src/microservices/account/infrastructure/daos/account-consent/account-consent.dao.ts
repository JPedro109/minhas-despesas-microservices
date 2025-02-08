import { Dynamo } from "@/shared";
import {
    AccountConsentDynamoModel,
    AccountConsentModel,
} from "./account-consent.models";

export class AccountConsentDAO {
    private readonly fatherEntity: string = "Account";
    private readonly entity: string = "AccountConsent";
    constructor(private readonly dynamo: Dynamo) {}

    async createAccount(
        data: AccountConsentModel,
    ): Promise<AccountConsentModel> {
        await this.dynamo.create(
            `${this.fatherEntity}#${data.accountId}`,
            `${this.entity}#${data.accountId}`,
            {
                Type: this.entity,
                AccountId: data.accountId,
                AccountConsentId: data.accountConsentId,
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
            `${this.entity}#`,
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

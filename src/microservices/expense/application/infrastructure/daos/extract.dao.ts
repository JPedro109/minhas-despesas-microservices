import { Dynamo } from "@/shared";
import { AccountDAO } from "./account.dao";

export type ExtractDynamoModel = {
    AccountId: string;
    ExtractId: string;
    Url: string;
    ReferenceYear: number;
    ReferenceMonth: number;
    ExpiryDate: Date;
    UrlExpiryDate: Date;
    CreatedAt: Date;
};

export type ExtractModel = {
    accountId: string;
    extractId: string;
    url: string;
    referenceYear: number;
    referenceMonth: number;
    expiryDate: Date;
    urlExpiryDate: Date;
    createdAt: Date;
};

export class ExtractDAO {
    private readonly fatherEntity: string = AccountDAO.entity;
    static entity: string = "Extract";

    constructor(private readonly dynamo: Dynamo) {}

    async createExtract(
        data: Omit<ExtractModel, "createdAt">,
    ): Promise<ExtractModel> {
        await this.dynamo.create(
            `${this.fatherEntity}#${data.accountId}`,
            `${ExtractDAO.entity}#${data.extractId}`,
            {
                Type: ExtractDAO.entity,
                AccountId: data.extractId,
                ExtractId: data.extractId,
                ReferenceMonth: data.referenceMonth,
                ReferenceYear: data.referenceYear,
                UrlExpiryDate: data.urlExpiryDate.toISOString(),
                ExpiryDate: data.expiryDate.toISOString(),
                CreatedAt: new Date().toISOString(),
                Url: data.url,
                expiration_time: Math.floor(data.expiryDate.getTime() / 1000),
            },
        );

        return await this.getExtractsByAccountIdAndExtractId(
            data.accountId,
            data.extractId,
        );
    }

    async getExtractsByAccountId(accountId: string): Promise<ExtractModel[]> {
        const items = await this.dynamo.get<ExtractDynamoModel>(
            `${this.fatherEntity}#${accountId}`,
            `${ExtractDAO.entity}#`,
            {
                skBeginsWith: true,
            },
        );

        if (!items.length) return [];

        return items.map((item) => ({
            accountId: item.AccountId,
            extractId: item.ExtractId,
            url: item.Url,
            referenceMonth: item.ReferenceMonth,
            referenceYear: item.ReferenceYear,
            urlExpiryDate: new Date(item.UrlExpiryDate),
            expiryDate: new Date(item.ExpiryDate),
            createdAt: new Date(item.CreatedAt),
        }));
    }

    async getExtractsByAccountIdAndExtractId(
        accountId: string,
        expenseId: string,
    ): Promise<ExtractModel | null> {
        const item = await this.dynamo.getOne<ExtractDynamoModel>(
            `${this.fatherEntity}#${accountId}`,
            `${ExtractDAO.entity}#${expenseId}`,
        );

        if (!item) return null;

        return {
            accountId: item.AccountId,
            extractId: item.ExtractId,
            url: item.Url,
            referenceMonth: item.ReferenceMonth,
            referenceYear: item.ReferenceYear,
            urlExpiryDate: new Date(item.UrlExpiryDate),
            expiryDate: new Date(item.ExpiryDate),
            createdAt: new Date(item.CreatedAt),
        };
    }
}

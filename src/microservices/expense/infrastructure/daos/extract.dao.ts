import { Dynamo } from "@/shared";

export type ExtractDynamoModel = {
    AccountId: string;
    ExtractId: string;
    ReferenceYear: number;
    ReferenceMonth: number;
    ExpiryDate: Date;
    UrlExpiryDate: Date;
    CreatedAt: Date;
};

export type ExtractModel = {
    accountId: string;
    extractId: string;
    referenceYear: number;
    referenceMonth: number;
    expiryDate: Date;
    urlExpiryDate: Date;
    createdAt: Date;
};

export class ExtractDAO {
    private readonly fatherEntity: string = "Account";
    static entity: string = "Extract";

    constructor(private readonly dynamo: Dynamo) {}

    async createExtract(
        data: Omit<ExtractModel, "createdAt" | "updatedAt">,
    ): Promise<ExtractModel> {
        await this.dynamo.create(
            `${this.fatherEntity}#${data.accountId}`,
            `${ExtractDAO.entity}#${data.extractId}`,
            {
                Type: ExtractDAO.entity,
                ExtractId: data.extractId,
                ReferenceMonth: data.referenceMonth,
                ReferenceYear: data.referenceYear,
                UrlExpiryDate: data.urlExpiryDate,
                ExpiryDate: data.expiryDate,
                CreatedAt: new Date().toISOString(),
            },
        );

        return await this.getExtractByAccountIdAndExtractId(
            data.accountId,
            data.extractId,
        );
    }

    async getExtractByAccountId(accountId: string): Promise<ExtractModel[]> {
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
            referenceMonth: item.ReferenceMonth,
            referenceYear: item.ReferenceYear,
            urlExpiryDate: item.UrlExpiryDate,
            expiryDate: item.ExpiryDate,
            createdAt: item.CreatedAt,
        }));
    }

    async getExtractByAccountIdAndExtractId(
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
            referenceMonth: item.ReferenceMonth,
            referenceYear: item.ReferenceYear,
            urlExpiryDate: item.UrlExpiryDate,
            expiryDate: item.ExpiryDate,
            createdAt: item.CreatedAt,
        };
    }
}

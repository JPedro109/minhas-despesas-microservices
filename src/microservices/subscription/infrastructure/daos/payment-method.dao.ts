import { Dynamo } from "@/shared";

export type PaymentMethodDynamoModel = {
    AccountId: string;
    PaymentMethodId: string;
    Name: string;
    Token: string;
    CreatedAt: Date;
    UpdatedAt?: Date;
};

export type PaymentMethodModel = {
    accountId: string;
    paymentMethodId: string;
    name: string;
    token: string;
    createdAt: Date;
    updatedAt?: Date;
};

export class PaymentMethodDAO {
    private readonly fatherEntity: string = "Account";
    static entity: string = "PaymentMethod";

    constructor(private readonly dynamo: Dynamo) {}

    async createPaymentMethod(
        data: Omit<PaymentMethodModel, "createdAt" | "updatedAt">,
    ): Promise<PaymentMethodModel> {
        await this.dynamo.create(
            `${this.fatherEntity}#${data.accountId}`,
            `${PaymentMethodDAO.entity}#${data.paymentMethodId}`,
            {
                Type: PaymentMethodDAO.entity,
                AccountId: data.accountId,
                PaymentMethodId: data.paymentMethodId,
                Name: data.name,
                Token: data.token,
                CreatedAt: new Date().toISOString(),
            },
        );

        return await this.getPaymentMethodByAccountId(data.accountId);
    }

    async getPaymentMethodByAccountId(
        accountId: string,
    ): Promise<PaymentMethodModel | null> {
        const item = await this.dynamo.get<PaymentMethodDynamoModel>(
            `${this.fatherEntity}#${accountId}`,
            `${PaymentMethodDAO.entity}#`,
            {
                skBeginsWith: true,
            },
        );

        if (!item.length) return null;

        return {
            accountId: item[0].AccountId,
            paymentMethodId: item[0].PaymentMethodId,
            name: item[0].Name,
            token: item[0].Token,
            createdAt: item[0].CreatedAt,
            updatedAt: item[0].UpdatedAt,
        };
    }

    async updatePaymentMethodByAccountIdAndPaymentMethodId(
        accountId: string,
        paymentMethodId: string,
        paymentMethod: PaymentMethodModel,
    ): Promise<void> {
        await this.dynamo.updateOne(
            `${this.fatherEntity}#${accountId}`,
            `${PaymentMethodDAO.entity}#${paymentMethodId}`,
            {
                Name: paymentMethod.name,
                Token: paymentMethod.token,
                UpdatedAt: new Date().toISOString(),
            },
        );
    }

    async deletePaymentMethodByAccountIdAndPaymentMethodId(
        accountId: string,
        paymentMethodId: string,
    ): Promise<void> {
        await this.dynamo.deleteOne(
            `${this.fatherEntity}#${accountId}`,
            `${PaymentMethodDAO.entity}#${paymentMethodId}`,
        );
    }
}

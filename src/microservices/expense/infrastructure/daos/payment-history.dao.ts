import { Dynamo } from "@/shared";
import { ExpenseDAO } from "./expense.dao";

export type PaymentHistoryDynamoModel = {
    AccountId: string;
    PaymentHistoryId: string;
    ExpenseId: string;
    ExpenseName: string;
    ExpenseValue: number;
    ExpenseDueDate: Date;
    PaymentDate: Date;
    CreatedAt: Date;
};

export type PaymentHistoryModel = {
    accountId: string;
    expenseId: string;
    paymentHistoryId: string;
    expenseName: string;
    expenseValue: number;
    expenseDueDate: Date;
    paymentDate: Date;
    createdAt: Date;
};

export class PaymentHistoryDAO {
    private readonly fatherEntity: string = "Account";
    static entity: string = "PaymentHistory";

    constructor(private readonly dynamo: Dynamo) {}

    async createPaymentHistory(
        data: Omit<PaymentHistoryModel, "createdAt">,
    ): Promise<PaymentHistoryModel> {
        await this.dynamo.create(
            `${this.fatherEntity}#${data.accountId}`,
            `${PaymentHistoryDAO.entity}#${data.paymentHistoryId}`,
            {
                Type: PaymentHistoryDAO.entity,
                AccountId: data.accountId,
                PaymentHistoryId: data.paymentHistoryId,
                ExpenseId: data.expenseId,
                ExpenseName: data.expenseName,
                ExpenseValue: data.expenseValue,
                ExpenseDueDate: data.expenseDueDate.toISOString(),
                PaymentDate: data.paymentDate.toISOString(),
                CreatedAt: new Date().toISOString(),
                GSI1PK: `${ExpenseDAO.entity}#${data.expenseId}`,
                GSI1SK: `${PaymentHistoryDAO.entity}#${data.expenseDueDate.toISOString()}#${data.paymentHistoryId}`,
            },
        );

        return await this.getPaymentHistoryByAccountIdAndPaymentHistoryId(
            data.accountId,
            data.expenseId,
        );
    }

    async getPaymentHistoryByExpenseIdAndExpenseDueDate(
        expenseId: string,
        expenseDueDate: Date,
    ): Promise<PaymentHistoryModel | null> {
        const items = await this.dynamo.get<PaymentHistoryDynamoModel>(
            `${ExpenseDAO.entity}#${expenseId}`,
            `${PaymentHistoryDAO.entity}#${expenseDueDate.toISOString()}#`,
            {
                skBeginsWith: true,
                indexName: "GSI1",
            },
        );

        if (!items.length) return null;

        return {
            accountId: items[0].AccountId,
            expenseId: items[0].ExpenseId,
            paymentHistoryId: items[0].PaymentHistoryId,
            expenseName: items[0].ExpenseName,
            expenseValue: items[0].ExpenseValue,
            expenseDueDate: new Date(items[0].ExpenseDueDate),
            paymentDate: new Date(items[0].PaymentDate),
            createdAt: new Date(items[0].CreatedAt),
        };
    }

    async getPaymentHistoryByAccountIdAndPaymentHistoryId(
        accountId: string,
        paymentHistoryId: string,
    ): Promise<PaymentHistoryModel | null> {
        const item = await this.dynamo.getOne<PaymentHistoryDynamoModel>(
            `${this.fatherEntity}#${accountId}`,
            `${PaymentHistoryDAO.entity}#${paymentHistoryId}`,
        );

        if (!item) return null;

        return {
            accountId: item.AccountId,
            expenseId: item.ExpenseId,
            paymentHistoryId: item.PaymentHistoryId,
            expenseName: item.ExpenseName,
            expenseValue: item.ExpenseValue,
            expenseDueDate: new Date(item.ExpenseDueDate),
            paymentDate: new Date(item.PaymentDate),
            createdAt: new Date(item.CreatedAt),
        };
    }

    async getPaymentHistoryByAccountIdAndExpenseDueMonthAndExpenseDueYear(
        accountId: string,
        expenseDueMonth: number,
        expenseDueYear: number,
    ): Promise<PaymentHistoryModel[]> {
        const items = await this.dynamo.get<PaymentHistoryDynamoModel>(
            `${this.fatherEntity}#${accountId}`,
            `${PaymentHistoryDAO.entity}#`,
            {
                skBeginsWith: true,
                filters: [
                    {
                        column: "ExpenseDueDate",
                        expression: ">=",
                        value: new Date(
                            expenseDueYear,
                            expenseDueMonth,
                        ).toISOString(),
                    },
                    {
                        column: "ExpenseDueDate",
                        expression: "<=",
                        value: new Date(
                            expenseDueYear,
                            expenseDueMonth,
                            0,
                        ).toISOString(),
                    },
                ],
            },
        );

        if (!items) return null;

        return items.map((item) => ({
            accountId: item.AccountId,
            expenseId: item.ExpenseId,
            paymentHistoryId: item.PaymentHistoryId,
            expenseName: item.ExpenseName,
            expenseValue: item.ExpenseValue,
            expenseDueDate: new Date(item.ExpenseDueDate),
            paymentDate: new Date(item.PaymentDate),
            createdAt: new Date(item.CreatedAt),
        }));
    }

    async deletePaymentHistoriesByExpenseId(expenseId: string): Promise<void> {
        await this.dynamo.deleteSubPartion(
            `${ExpenseDAO.entity}#${expenseId}`,
            `${PaymentHistoryDAO.entity}#`,
            "GSI1",
        );
    }

    async deletePaymentHistoryByAccountIdAndPaymentHistoryId(
        accountId: string,
        paymentHistoryId: string,
    ): Promise<void> {
        await this.dynamo.deleteOne(
            `${this.fatherEntity}#${accountId}`,
            `${PaymentHistoryDAO.entity}#${paymentHistoryId}`,
        );
    }
}

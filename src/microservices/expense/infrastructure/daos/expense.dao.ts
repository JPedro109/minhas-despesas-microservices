import { Dynamo } from "@/shared";

export type ExpenseDynamoModel = {
    AccountId: string;
    ExpenseId: string;
    ExpenseName: string;
    ExpenseValue: number;
    ExpenseDueDate: Date;
    Paid: boolean;
    CreatedAt: Date;
    UpdatedAt: Date;
};

export type ExpenseModel = {
    accountId: string;
    expenseId: string;
    expenseName: string;
    expenseValue: number;
    expenseDueDate: Date;
    paid: boolean;
    createdAt: Date;
    updatedAt: Date;
};

export class ExpenseDAO {
    private readonly fatherEntity: string = "Account";
    static entity: string = "Expense";

    constructor(private readonly dynamo: Dynamo) {}

    async createExpense(
        data: Omit<ExpenseModel, "createdAt" | "updatedAt">,
    ): Promise<ExpenseModel> {
        await this.dynamo.create(
            `${this.fatherEntity}#${data.accountId}`,
            `${ExpenseDAO.entity}#${data.expenseId}`,
            {
                Type: ExpenseDAO.entity,
                AccountId: data.accountId,
                ExpenseId: data.expenseId,
                ExpenseName: data.expenseName,
                ExpenseValue: data.expenseValue,
                ExpenseDueDate: data.expenseDueDate,
                Paid: data.paid,
                CreatedAt: new Date().toISOString(),
                GSI1PK: "EXPENSES",
                GSI1SK: data.expenseId,
            },
        );

        return await this.getExpenseByAccountIdAndExpenseId(
            data.accountId,
            data.expenseId,
        );
    }

    async getExpensesByAccountId(accountId: string): Promise<ExpenseModel[]> {
        const items = await this.dynamo.get<ExpenseDynamoModel>(
            `${this.fatherEntity}#${accountId}`,
            `${ExpenseDAO.entity}#`,
            {
                skBeginsWith: true,
            },
        );

        if (!items.length) return [];

        return items.map((item) => ({
            accountId: item.AccountId,
            expenseId: item.ExpenseId,
            expenseName: item.ExpenseName,
            expenseValue: item.ExpenseValue,
            expenseDueDate: new Date(item.ExpenseDueDate),
            paid: item.Paid,
            createdAt: new Date(item.CreatedAt),
            updatedAt: item.UpdatedAt ? new Date(item.UpdatedAt) : null,
        }));
    }

    async getExpensesByExpenseDueYearAndExpenseDueMonthAndPaymentStatus(
        expenseDueYear: number,
        expenseDueMonth: number,
        paymentStatus: boolean,
    ): Promise<ExpenseModel[]> {
        const items = await this.dynamo.get<ExpenseDynamoModel>(
            "EXPENSES",
            null,
            {
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
                    {
                        column: "Paid",
                        expression: "=",
                        value: paymentStatus,
                    },
                ],
            },
        );

        if (!items) return null;

        return items.map((item) => ({
            accountId: item.AccountId,
            expenseId: item.ExpenseId,
            expenseName: item.ExpenseName,
            expenseValue: item.ExpenseValue,
            expenseDueDate: new Date(item.ExpenseDueDate),
            paid: item.Paid,
            createdAt: new Date(item.CreatedAt),
            updatedAt: item.UpdatedAt ? new Date(item.UpdatedAt) : null,
        }));
    }

    async getExpenseByAccountIdAndExpenseId(
        accountId: string,
        expenseId: string,
    ): Promise<ExpenseModel | null> {
        const item = await this.dynamo.getOne<ExpenseDynamoModel>(
            `${this.fatherEntity}#${accountId}`,
            `${ExpenseDAO.entity}#${expenseId}`,
        );

        if (!item) return null;

        return {
            accountId: item.AccountId,
            expenseId: item.ExpenseId,
            expenseName: item.ExpenseName,
            expenseValue: item.ExpenseValue,
            expenseDueDate: new Date(item.ExpenseDueDate),
            paid: item.Paid,
            createdAt: new Date(item.CreatedAt),
            updatedAt: item.UpdatedAt ? new Date(item.UpdatedAt) : null,
        };
    }

    async updateExpenseByAccountIdAndExpenseId(
        accountId: string,
        expenseId: string,
        data: ExpenseModel,
    ): Promise<void> {
        await this.dynamo.updateOne(
            `${this.fatherEntity}#${accountId}`,
            `${ExpenseDAO.entity}#${expenseId}`,
            {
                ExpenseName: data.expenseName,
                ExpenseValue: data.expenseValue,
                ExpenseDueDate: data.expenseDueDate,
                Paid: data.paid,
                UpdatedAt: new Date().toISOString(),
            },
        );
    }

    async updateExpensesByAccountIdAndExpenseId(
        datas: {
            accountId: string;
            expenseId: string;
            data: ExpenseModel;
        }[],
    ): Promise<void> {
        await this.dynamo.updateMany(
            datas.map((x) => ({
                pk: `${this.fatherEntity}#${x.accountId}`,
                sk: `${ExpenseDAO.entity}#${x.expenseId}`,
                data: x,
            })),
        );
    }

    async deleteExpenseByAccountIdAndExpenseId(
        accountId: string,
        expenseId: string,
    ): Promise<void> {
        await this.dynamo.deleteOne(
            `${this.fatherEntity}#${accountId}`,
            `${ExpenseDAO.entity}#${expenseId}`,
        );
    }
}

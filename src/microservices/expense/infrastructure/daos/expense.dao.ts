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
            },
        );

        return await this.getExpenseByAccountIdAndExpenseId(
            data.accountId,
            data.expenseId,
        );
    }

    async getExpenseByAccountId(accountId: string): Promise<ExpenseModel[]> {
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
            expenseDueDate: item.ExpenseDueDate,
            paid: item.Paid,
            createdAt: item.CreatedAt,
            updatedAt: item.UpdatedAt,
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
            expenseDueDate: item.ExpenseDueDate,
            paid: item.Paid,
            createdAt: item.CreatedAt,
            updatedAt: item.UpdatedAt,
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

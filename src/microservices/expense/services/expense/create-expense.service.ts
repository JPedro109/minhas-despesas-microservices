import { ForbiddenError, NotFoundError, RequestSchema, Utils } from "@/shared";
import { AccountDAO, ExpenseDAO } from "../../infrastructure";

export type CreateExpenseDTO = {
    accountId: string;
    expenseName: string;
    expenseValue: number;
    expenseDueDate: Date;
};

export const createExpenseSchema: RequestSchema = {
    accountId: {
        type: "string",
        optional: false,
    },
    expenseName: {
        type: "string",
        optional: false,
    },
    expenseValue: {
        type: "string",
        optional: false,
    },
    expenseDueDate: {
        type: "date",
        optional: false,
    },
};

export class CreateExpenseService {
    constructor(
        private readonly accountDAO: AccountDAO,
        private readonly expenseDAO: ExpenseDAO,
    ) {}

    async execute({
        accountId,
        expenseName,
        expenseValue,
        expenseDueDate,
    }: CreateExpenseDTO): Promise<string> {
        const accountExists = await this.accountDAO.getAccountById(accountId);
        if (!accountExists) throw new NotFoundError("A conta não existe");

        const expenses =
            await this.expenseDAO.getExpensesByAccountId(accountId);
        if (expenses.length === 10) {
            throw new ForbiddenError(
                "Você atingiu o número máximo de despesas que podem ser criadas",
            );
        }

        const expenseCreated = await this.expenseDAO.createExpense({
            accountId,
            expenseId: Utils.createUUID(),
            expenseName,
            expenseValue,
            expenseDueDate,
            paid: false,
        });

        return expenseCreated.expenseId;
    }
}

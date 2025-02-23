import { NotFoundError, RequestSchema } from "@/shared";
import { ExpenseDAO } from "../../infrastructure";

export type UpdateExpenseDTO = {
    accountId: string;
    expenseId: string;
    expenseName: string;
    expenseValue: number;
    expenseDueDate: Date;
};

export const updateExpenseSchema: RequestSchema = {
    accountId: {
        type: "string",
        optional: false,
    },
    expenseId: {
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

export class UpdateExpenseService {
    constructor(private readonly expenseDAO: ExpenseDAO) {}

    async execute({
        accountId,
        expenseId,
        expenseName,
        expenseValue,
        expenseDueDate,
    }: UpdateExpenseDTO): Promise<void> {
        const expense = await this.expenseDAO.getExpenseByAccountIdAndExpenseId(
            accountId,
            expenseId,
        );
        if (!expense) {
            throw new NotFoundError("Essa despesa não existe");
        }

        expense.expenseName = expenseName;
        expense.expenseValue = expenseValue;
        expense.expenseDueDate = expenseDueDate;

        await this.expenseDAO.updateExpenseByAccountIdAndExpenseId(
            accountId,
            expenseId,
            expense,
        );
    }
}

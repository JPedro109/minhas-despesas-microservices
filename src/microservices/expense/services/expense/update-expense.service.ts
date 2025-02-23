import { NotFoundError } from "@/shared";
import { ExpenseDAO } from "../../infrastructure";

export type UpdateExpenseDTO = {
    accountId: string;
    expenseId: string;
    expenseName: string;
    expenseValue: number;
    dueDate: Date;
};

export class UpdateExpenseUseCase {
    constructor(private readonly expenseDAO: ExpenseDAO) {}

    async execute({
        accountId,
        expenseId,
        expenseName,
        expenseValue,
        dueDate,
    }: UpdateExpenseDTO): Promise<void> {
        const expense =
            await this.expenseDAO.getExpensesByAccountIdAndExpenseId(
                accountId,
                expenseId,
            );
        if (!expense) {
            throw new NotFoundError("Essa despesa não existe");
        }

        expense.expenseName = expenseName;
        expense.expenseValue = expenseValue;
        expense.expenseDueDate = dueDate;

        await this.expenseDAO.updateExpenseByAccountIdAndExpenseId(
            accountId,
            expenseId,
            expense,
        );
    }
}

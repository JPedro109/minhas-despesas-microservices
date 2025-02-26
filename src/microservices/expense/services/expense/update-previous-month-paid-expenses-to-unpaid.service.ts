import { ExpenseDAO } from "../../infrastructure";

export class UpdatePreviousMonthPaidExpensesToUnpaidService {
    constructor(private readonly expenseDAO: ExpenseDAO) {}

    async execute(): Promise<void> {
        const dateWithPreviousMonth = new Date();
        dateWithPreviousMonth.setMonth(dateWithPreviousMonth.getUTCMonth() - 1);
        const expenses =
            await this.expenseDAO.getExpensesByExpenseDueYearAndExpenseDueMonthAndPaymentStatus(
                dateWithPreviousMonth.getUTCFullYear(),
                dateWithPreviousMonth.getUTCMonth(),
                true,
            );

        const updatedExpenses = expenses.map((x) => {
            x.expenseDueDate.setMonth(x.expenseDueDate.getUTCMonth() + 1);

            return {
                ...x,
                paid: false,
            };
        });

        await this.expenseDAO.updateExpensesByAccountIdAndExpenseId(
            updatedExpenses.map((x) => ({
                accountId: x.accountId,
                expenseId: x.expenseId,
                data: x,
            })),
        );
    }
}

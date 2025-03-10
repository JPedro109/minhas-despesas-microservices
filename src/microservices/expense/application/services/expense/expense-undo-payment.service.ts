import { NotFoundError, RequestSchema } from "@/shared";
import { ExpenseDAO, PaymentHistoryDAO } from "../../infrastructure";

export type ExpenseUndoPaymentDTO = {
    accountId: string;
    expenseId: string;
};

export const expenseUndoPaymentSchema: RequestSchema = {
    accountId: {
        type: "string",
        optional: false,
    },
    expenseId: {
        type: "string",
        optional: false,
    },
};

export class ExpenseUndoPaymentService {
    constructor(
        private readonly expenseDAO: ExpenseDAO,
        private readonly paymentHistoryDAO: PaymentHistoryDAO,
    ) {}

    async execute({
        accountId,
        expenseId,
    }: ExpenseUndoPaymentDTO): Promise<void> {
        const expense = await this.expenseDAO.getExpenseByAccountIdAndExpenseId(
            accountId,
            expenseId,
        );
        if (!expense) {
            throw new NotFoundError("Essa despesa não existe");
        }
        const oldExpense = { ...expense };

        const paymentHistory =
            await this.paymentHistoryDAO.getPaymentHistoryByExpenseIdAndExpenseDueDate(
                expenseId,
                expense.expenseDueDate,
            );

        expense.paid = false;
        await this.expenseDAO.updateExpenseByAccountIdAndExpenseId(
            accountId,
            expenseId,
            expense,
        );

        try {
            await this.paymentHistoryDAO.deletePaymentHistoryByAccountIdAndPaymentHistoryId(
                paymentHistory.accountId,
                paymentHistory.paymentHistoryId,
            );
        } catch (e) {
            await this.expenseDAO.updateExpenseByAccountIdAndExpenseId(
                accountId,
                expenseId,
                oldExpense,
            );
            throw e;
        }
    }
}

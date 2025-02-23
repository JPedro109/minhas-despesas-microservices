import { NotFoundError, RequestSchema } from "@/shared";
import { ExpenseDAO, PaymentHistoryDAO } from "../../infrastructure";

export type DeleteExpenseDTO = {
    accountId: string;
    expenseId: string;
    deleteExpensePaymentHistory: boolean;
};

export const deleteExpenseSchema: RequestSchema = {
    accountId: {
        type: "string",
        optional: false,
    },
    expenseId: {
        type: "string",
        optional: false,
    },
    deleteExpensePaymentHistory: {
        type: "boolean",
        optional: false,
    },
};

export class DeleteExpenseService {
    constructor(
        private readonly expenseDAO: ExpenseDAO,
        private readonly paymentHistoryDAO: PaymentHistoryDAO,
    ) {}

    async execute({
        accountId,
        expenseId,
        deleteExpensePaymentHistory,
    }: DeleteExpenseDTO): Promise<void> {
        const expense =
            await this.expenseDAO.getExpensesByAccountIdAndExpenseId(
                accountId,
                expenseId,
            );
        if (!expense) {
            throw new NotFoundError("Essa despesa não existe");
        }

        await this.expenseDAO.deleteExpenseByAccountIdAndExpenseId(
            accountId,
            expenseId,
        );

        try {
            if (deleteExpensePaymentHistory) {
                await this.paymentHistoryDAO.deletePaymentHistoriesByAccountId(
                    accountId,
                );
            }
        } catch (e) {
            await this.expenseDAO.createExpense(expense);
            throw e;
        }
    }
}

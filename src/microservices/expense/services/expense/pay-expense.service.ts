import { NotFoundError, RequestSchema, Utils } from "@/shared";
import { ExpenseDAO, PaymentHistoryDAO } from "../../infrastructure";

export type PayExpenseDTO = {
    accountId: string;
    expenseId: string;
};

export const payExpenseSchema: RequestSchema = {
    accountId: {
        type: "string",
        optional: false,
    },
    expenseId: {
        type: "string",
        optional: false,
    },
};

export class PayExpenseService {
    constructor(
        private readonly expenseDAO: ExpenseDAO,
        private readonly paymentHistoryDAO: PaymentHistoryDAO,
    ) {}

    async execute({ accountId, expenseId }: PayExpenseDTO): Promise<void> {
        const expense =
            await this.expenseDAO.getExpensesByAccountIdAndExpenseId(
                accountId,
                expenseId,
            );
        if (!expense) {
            throw new NotFoundError("Essa despesa não existe");
        }
        const oldExpense = { ...expense };

        const currentDate = new Date().getTime();
        if (currentDate > expense.expenseDueDate.getTime()) {
            expense.expenseDueDate = new Date(
                expense.expenseDueDate.getUTCFullYear(),
                expense.expenseDueDate.getUTCMonth() + 1,
                expense.expenseDueDate.getUTCDate(),
            );
        } else {
            expense.paid = true;
        }

        await this.expenseDAO.updateExpenseByAccountIdAndExpenseId(
            accountId,
            expenseId,
            expense,
        );

        try {
            await this.paymentHistoryDAO.createPaymentHistory({
                paymentHistoryId: Utils.createUUID(),
                accountId: expense.accountId,
                expenseId: expense.expenseId,
                expenseName: expense.expenseName,
                expenseValue: expense.expenseValue,
                expenseDueDate: expense.expenseDueDate,
                paymentDate: new Date(),
            });
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

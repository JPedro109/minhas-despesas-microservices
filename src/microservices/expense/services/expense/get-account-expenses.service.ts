import { NotFoundError } from "@/shared";
import { AccountDAO, ExpenseDAO } from "../../infrastructure";

export type GetAccountExpensesDTO = {
    accountId: string;
};

export type GetAccountExpensesResponseDTO = {
    accountId: string;
    expenseId: string;
    expenseName: string;
    expenseValue: number;
    dueDate: Date;
    paid: boolean;
};

export class GetAccountExpensesUseCase {
    constructor(
        private readonly accountDAO: AccountDAO,
        private readonly expenseDAO: ExpenseDAO,
    ) {}

    async execute({
        accountId,
    }: GetAccountExpensesDTO): Promise<GetAccountExpensesResponseDTO[]> {
        const accountExists = await this.accountDAO.getAccountById(accountId);
        if (!accountExists) throw new NotFoundError("A conta não existe");

        const expenses =
            await this.expenseDAO.getExpensesByAccountId(accountId);

        return expenses.map((x) => ({
            accountId: x.accountId,
            expenseId: x.expenseId,
            expenseName: x.expenseName,
            expenseValue: x.expenseValue,
            dueDate: x.expenseDueDate,
            paid: x.paid,
        }));
    }
}

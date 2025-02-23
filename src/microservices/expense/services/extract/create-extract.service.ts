import { ForbiddenError, NotFoundError, Utils } from "@/shared";
import {
    AccountDAO,
    ExtractDAO,
    PaymentHistoryDAO,
    Bucket,
    Extract,
} from "../../infrastructure";

export type CreateExtractDTO = {
    accountId: string;
    referenceMonth: number;
    referenceYear: number;
};

export class CreateExtractUseCase {
    constructor(
        private readonly accountDAO: AccountDAO,
        private readonly paymentHistoryDAO: PaymentHistoryDAO,
        private readonly extractDAO: ExtractDAO,
        private readonly extract: Extract,
        private readonly bucket: Bucket,
    ) {}

    async execute({
        accountId,
        referenceMonth,
        referenceYear,
    }: CreateExtractDTO): Promise<string> {
        const accountExists = await this.accountDAO.getAccountById(accountId);

        if (!accountExists) throw new NotFoundError("A conta não existe");

        const paymentHistories =
            await this.paymentHistoryDAO.getPaymentHistoryByAccountIdAndExpenseDueMonthAndExpenseDueYear(
                accountId,
                referenceMonth,
                referenceYear,
            );
        if (paymentHistories.length === 0) {
            throw new NotFoundError(
                "Não existe histórico de despesas para o mês e ano de referência",
            );
        }
        const extracts =
            await this.extractDAO.getExtractsByAccountId(accountId);
        if (extracts.length === 1) {
            throw new ForbiddenError("Você já tem o número máximo de extratos");
        }

        const today = new Date();

        const expiryDateExtract = new Date(
            today.getUTCFullYear(),
            today.getUTCMonth(),
            today.getUTCDate(),
            0,
            0,
            0,
        );
        expiryDateExtract.setDate(expiryDateExtract.getUTCDate() + 30);

        const urlExpiryDateExtract = new Date(
            today.getUTCFullYear(),
            today.getUTCMonth(),
            today.getUTCDate(),
            0,
            0,
            0,
        );
        urlExpiryDateExtract.setDate(urlExpiryDateExtract.getUTCDate() + 5);

        const paymentHistoriesFormated = paymentHistories.map((x) => ({
            expenseId: x.expenseId,
            expenseName: x.expenseName,
            expenseValue: x.expenseValue,
            dueDate: x.expenseDueDate,
            paidDate: x.paymentDate,
        }));
        const file = await this.extract.generateExpensesExtract({
            referenceMonth,
            referenceYear,
            data: paymentHistoriesFormated,
        });

        const url = await this.bucket.uploadFile(
            `extract-expense-${accountId}-${Date.now()}.pdf`,
            file,
        );

        const extractCreated = await this.extractDAO.createExtract({
            accountId,
            expiryDate: expiryDateExtract,
            extractId: Utils.createUUID(),
            referenceMonth,
            referenceYear,
            urlExpiryDate: urlExpiryDateExtract,
            url,
        });

        return extractCreated.extractId;
    }
}

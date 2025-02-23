import { NotFoundError } from "@/shared";
import { AccountDAO, ExtractDAO } from "../../infrastructure";

export type GetUserExtractsDTO = {
    accountId: string;
};

export type GetUserExtractsResponseDTO = {
    extractId: string;
    url: string;
    accountId: string;
    expiryDate: Date;
    urlExpiryDate: Date;
};

export class GetUserExtractsUseCase {
    constructor(
        private readonly accountDAO: AccountDAO,
        private readonly extractDAO: ExtractDAO,
    ) {}

    async execute({
        accountId,
    }: GetUserExtractsDTO): Promise<GetUserExtractsResponseDTO[]> {
        const accountExists = await this.accountDAO.getAccountById(accountId);

        if (!accountExists) {
            throw new NotFoundError("Essa conta não existe");
        }

        const extracts =
            await this.extractDAO.getExtractsByAccountId(accountId);

        return extracts.map((x) => ({
            extractId: x.extractId,
            url: x.url,
            accountId: x.accountId,
            expiryDate: x.expiryDate,
            urlExpiryDate: x.urlExpiryDate,
        }));
    }
}

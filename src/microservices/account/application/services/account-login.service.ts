import { RequestSchema } from "@/shared";
import { IdentityProvider } from "../infrastructure";

export type AccountLoginDTO = {
    email: string;
    password: string;
};

export type AccountLoginResponseDTO = {
    accessToken: string;
    refreshToken: string;
    identityProviderId: string;
};

export const accountLoginSchema: RequestSchema = {
    email: {
        type: "string",
        optional: false,
    },
    password: {
        type: "string",
        optional: false,
    },
};

export class AccountLoginService {
    constructor(private readonly identityProvider: IdentityProvider) {}

    async execute({
        email,
        password,
    }: AccountLoginDTO): Promise<AccountLoginResponseDTO> {
        const tokens = await this.identityProvider.login(email, password);

        const { identityProviderId } =
            await this.identityProvider.getAccountInfo(email);

        return {
            ...tokens,
            identityProviderId,
        };
    }
}

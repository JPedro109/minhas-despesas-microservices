import { IdentityProvider } from "../infrastructure";

export type AccountLoginDTO = {
    email: string;
    password: string;
};

export type AccountLoginResponseDTO = {
    accessToken: string;
    refreshToken: string;
};

export const accountLoginSchema = {
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
        return await this.identityProvider.login(email, password);
    }
}

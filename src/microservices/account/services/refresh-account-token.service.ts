import { IdentityProvider } from "../infrastructure";

export type RefreshAccountTokenDTO = {
    identityProviderId: string;
    refreshToken: string;
};

export const refreshAccountTotkenSchema = {
    identityProviderId: {
        type: "string",
        optional: false,
    },
    refreshToken: {
        type: "string",
        optional: false,
    },
};

export class RefreshAccountTokenService {
    constructor(private readonly identityProvider: IdentityProvider) {}

    async execute({
        identityProviderId,
        refreshToken,
    }: RefreshAccountTokenDTO): Promise<string> {
        return await this.identityProvider.refreshToken(
            identityProviderId,
            refreshToken,
        );
    }
}

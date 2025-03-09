import { NotFoundError, RequestSchema } from "@/shared";
import { ProfileDAO } from "../../infrastructure";

export type GetProfileDTO = {
    accountId: string;
};

export type GetProfileResponseDTO = {
    accountId: string;
    profileId: string;
    username: string;
};

export const getProfileSchema: RequestSchema = {
    accountId: {
        type: "string",
        optional: false,
    },
};

export class GetProfileService {
    constructor(private readonly profileDAO: ProfileDAO) {}

    async execute({
        accountId,
    }: GetProfileDTO): Promise<GetProfileResponseDTO> {
        const databaseProfile =
            await this.profileDAO.getProfileByAccountId(accountId);

        if (!databaseProfile) throw new NotFoundError("Esse perfil não existe");

        return {
            accountId: databaseProfile.accountId,
            profileId: databaseProfile.profileId,
            username: databaseProfile.username,
        };
    }
}

import { NotFoundError, RequestSchema } from "@/shared";
import { ProfileDAO } from "../../infrastructure";

export type UpdateProfileDTO = {
    accountId: string;
    username: string;
};

export const updateProfileSchema: RequestSchema = {
    accountId: {
        type: "string",
        optional: false,
    },
    username: {
        type: "string",
        optional: false,
    },
};

export class UpdateProfileService {
    constructor(private readonly profileDAO: ProfileDAO) {}

    async execute({ accountId, username }: UpdateProfileDTO): Promise<void> {
        const databaseProfile =
            await this.profileDAO.getProfileByAccountId(accountId);

        if (!databaseProfile) throw new NotFoundError("Esse perfil não existe");

        databaseProfile.username = username;

        await this.profileDAO.updateProfileByAccountIdAndProfileId(
            accountId,
            databaseProfile.profileId,
            databaseProfile,
        );
    }
}

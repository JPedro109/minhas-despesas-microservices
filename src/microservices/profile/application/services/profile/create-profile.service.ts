import { RequestSchema, Utils } from "@/shared";
import { ProfileDAO } from "../../infrastructure";

export type CreateProfileDTO = {
    accountId: string;
    username: string;
};

export const createProfileSchema: RequestSchema = {
    accountId: {
        type: "string",
        optional: false,
    },
    username: {
        type: "string",
        optional: false,
    },
};

export class CreateProfileService {
    constructor(private readonly profileDAO: ProfileDAO) {}

    async execute({ accountId, username }: CreateProfileDTO): Promise<string> {
        const databaseProfile = await this.profileDAO.createProfile({
            profileId: Utils.createUUID(),
            accountId,
            username,
        });
        return databaseProfile.accountId;
    }
}

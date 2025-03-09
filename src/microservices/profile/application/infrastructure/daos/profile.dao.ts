import { Dynamo } from "@/shared";
import { AccountDAO } from "./account.dao";

export type ProfileDynamoModel = {
    ProfileId: string;
    AccountId: string;
    Username: string;
    CreatedAt: Date;
    UpdatedAt: Date;
};

export type ProfileModel = {
    profileId: string;
    accountId: string;
    username: string;
    createdAt: Date;
    updatedAt: Date;
};

export class ProfileDAO {
    private readonly fatherEntity: string = AccountDAO.entity;
    static entity: string = "Profile";

    constructor(private readonly dynamo: Dynamo) {}

    async createProfile(
        data: Omit<ProfileModel, "createdAt" | "updatedAt">,
    ): Promise<ProfileModel> {
        await this.dynamo.create(
            `${this.fatherEntity}#${data.accountId}`,
            `${ProfileDAO.entity}#${data.profileId}`,
            {
                Type: ProfileDAO.entity,
                ProfileId: data.profileId,
                AccountId: data.accountId,
                Username: data.username,
                CreatedAt: new Date().toISOString(),
            },
        );

        return await this.getProfileByAccountId(data.accountId);
    }

    async getProfileByAccountId(
        accountId: string,
    ): Promise<ProfileModel | null> {
        const item = await this.dynamo.get<ProfileDynamoModel>(
            `${this.fatherEntity}#${accountId}`,
            `${ProfileDAO.entity}#`,
            {
                skBeginsWith: true,
            },
        );

        if (!item.length) return null;

        return {
            profileId: item[0].ProfileId,
            accountId: item[0].AccountId,
            username: item[0].Username,
            createdAt: new Date(item[0].CreatedAt),
            updatedAt: item[0].UpdatedAt ? new Date(item[0].UpdatedAt) : null,
        };
    }

    async updateProfileByAccountIdAndProfileId(
        accountId: string,
        profileId: string,
        profile: ProfileModel,
    ): Promise<void> {
        await this.dynamo.updateOne(
            `${this.fatherEntity}#${accountId}`,
            `${ProfileDAO.entity}#${profileId}`,
            {
                Username: profile.username,
                UpdatedAt: new Date().toISOString(),
            },
        );
    }
}

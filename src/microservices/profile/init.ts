import { Dynamo, Middy, Utils } from "@/shared";
import { ProfileDAO } from "./infrastructure";
import {
    createProfileSchema,
    getProfileSchema,
    updateProfileSchema,
    CreateProfileDTO,
    GetProfileDTO,
    GetProfileResponseDTO,
    UpdateProfileDTO,
    CreateProfileService,
    GetProfileService,
    UpdateProfileService,
} from "./services/profile";

const dynamo = new Dynamo("Profile");
const profileDAO = new ProfileDAO(dynamo);

export const handler = Middy.build([
    {
        path: "/profiles",
        method: "POST",
        successStatusCode: 201,
        handler: async (event): Promise<string> => {
            const { accountId } = event.requestContext.authorizer.jwt.claims;
            const { username } = event.body;

            const dto: CreateProfileDTO = {
                accountId: accountId as string,
                username,
            };
            Utils.validateRequestSchema(dto, createProfileSchema);

            return await new CreateProfileService(profileDAO).execute(dto);
        },
    },
    {
        path: "/profiles",
        method: "GET",
        successStatusCode: 200,
        handler: async (event): Promise<GetProfileResponseDTO> => {
            const { accountId } = event.requestContext.authorizer.jwt.claims;

            const dto: GetProfileDTO = {
                accountId: accountId as string,
            };
            Utils.validateRequestSchema(dto, getProfileSchema);

            return await new GetProfileService(profileDAO).execute(dto);
        },
    },
    {
        path: "/profiles",
        method: "PUT",
        successStatusCode: 204,
        handler: async (event): Promise<void> => {
            const { accountId } = event.requestContext.authorizer.jwt.claims;
            const { username } = event.body;

            const dto: UpdateProfileDTO = {
                accountId: accountId as string,
                username,
            };
            Utils.validateRequestSchema(dto, updateProfileSchema);

            await new UpdateProfileService(profileDAO).execute(dto);
        },
    },
]);

import { Middy, Utils } from "@/shared";
import {
    createProfileSchema,
    getProfileSchema,
    updateProfileSchema,
    CreateProfileDTO,
    GetProfileDTO,
    GetProfileResponseDTO,
    UpdateProfileDTO,
    createProfileService,
    getProfileService,
    updateProfileService,
} from "../application";

export const routes = Middy.build([
    {
        path: "/profiles",
        method: "POST",
        successStatusCode: 201,
        handler: async (event): Promise<string> => {
            const { username } = event.body;
            const { ["account_id"]: accountId } =
                event.requestContext.authorizer.jwt.claims;

            const dto: CreateProfileDTO = {
                accountId: accountId as string,
                username,
            };
            Utils.validateRequestSchema(dto, createProfileSchema);

            return await createProfileService.execute(dto);
        },
    },
    {
        path: "/profiles",
        method: "GET",
        successStatusCode: 200,
        handler: async (event): Promise<GetProfileResponseDTO> => {
            const { ["account_id"]: accountId } =
                event.requestContext.authorizer.jwt.claims;

            const dto: GetProfileDTO = {
                accountId: accountId as string,
            };
            Utils.validateRequestSchema(dto, getProfileSchema);

            return await getProfileService.execute(dto);
        },
    },
    {
        path: "/profiles",
        method: "PUT",
        successStatusCode: 204,
        handler: async (event): Promise<void> => {
            const { ["account_id"]: accountId } =
                event.requestContext.authorizer.jwt.claims;
            const { username } = event.body;

            const dto: UpdateProfileDTO = {
                accountId: accountId as string,
                username,
            };
            Utils.validateRequestSchema(dto, updateProfileSchema);

            await updateProfileService.execute(dto);
        },
    },
]);

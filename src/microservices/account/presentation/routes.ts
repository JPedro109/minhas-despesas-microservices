import { Middy, Utils } from "@/shared";
import {
    accountLoginSchema,
    createAccountSchema,
    deleteAccountSchema,
    recoveryPasswordSchema,
    refreshAccountTokenSchema,
    sendAccountEmailUpdateEmailSchema,
    sendPasswordRecoveryEmailSchema,
    updateAccountEmailSchema,
    updateAccountPasswordSchema,
    verifyAccountEmailSchema,
    AccountLoginDTO,
    CreateAccountDTO,
    DeleteAccountDTO,
    RecoveryPasswordDTO,
    RefreshAccountTokenDTO,
    SendAccountEmailUpdateEmailDTO,
    SendPasswordRecoveryEmailDTO,
    UpdateAccountEmailDTO,
    UpdateAccountPasswordDTO,
    VerifyAccountEmailDTO,
    AccountLoginResponseDTO,
} from "../services";
import {
    accountLoginService,
    createAccountService,
    deleteAccountService,
    recoveryPasswordService,
    refreshAccountTokenService,
    sendAccountEmailUpdateEmailService,
    sendPasswordRecoveryEmailService,
    updateAccountEmailService,
    updateAccountPasswordService,
    verifyAccountEmailService,
} from "../factories";

export const routes = Middy.build([
    {
        path: "/accounts/login",
        method: "POST",
        successStatusCode: 200,
        handler: async (event): Promise<AccountLoginResponseDTO> => {
            const { email, password } = event.body;

            const dto: AccountLoginDTO = {
                email,
                password,
            };
            Utils.validateRequestSchema(dto, accountLoginSchema);

            return await accountLoginService.execute(dto);
        },
    },
    {
        path: "/accounts",
        method: "POST",
        successStatusCode: 201,
        handler: async (event): Promise<string> => {
            const { email, password, consentVersion } = event.body;
            const {
                ["x-forwarded-for"]: xForwardedFor,
                ["user-agent"]: userAgent,
            } = event.headers;

            const dto: CreateAccountDTO = {
                email,
                password,
                consentVersion,
                ipAddress: xForwardedFor,
                userAgent,
            };
            Utils.validateRequestSchema(dto, createAccountSchema);

            return await createAccountService.execute(dto);
        },
    },
    {
        path: "/accounts",
        method: "DELETE",
        successStatusCode: 204,
        handler: async (event): Promise<void> => {
            const { sub, ["account_id"]: accountId } =
                event.requestContext.authorizer.jwt.claims;

            const dto: DeleteAccountDTO = {
                accountId: accountId as string,
                identityProviderId: sub as string,
            };
            Utils.validateRequestSchema(dto, deleteAccountSchema);

            await deleteAccountService.execute(dto);
        },
    },
    {
        path: "/accounts/recovery-password",
        method: "PATCH",
        successStatusCode: 204,
        handler: async (event): Promise<void> => {
            const { code, email, newPassword } = event.body;

            const dto: RecoveryPasswordDTO = {
                code,
                email,
                newPassword,
            };
            Utils.validateRequestSchema(dto, recoveryPasswordSchema);

            await recoveryPasswordService.execute(dto);
        },
    },
    {
        path: "/accounts/refresh-account-token",
        method: "POST",
        successStatusCode: 200,
        handler: async (event): Promise<string> => {
            const { refreshToken, identityProviderId } = event.body;

            const dto: RefreshAccountTokenDTO = {
                identityProviderId: identityProviderId as string,
                refreshToken,
            };
            Utils.validateRequestSchema(dto, refreshAccountTokenSchema);

            return await refreshAccountTokenService.execute(dto);
        },
    },
    {
        path: "/accounts/send-account-update-email",
        method: "POST",
        successStatusCode: 204,
        handler: async (event): Promise<void> => {
            const { newEmail } = event.body;
            const { sub } = event.requestContext.authorizer.jwt.claims;

            const dto: SendAccountEmailUpdateEmailDTO = {
                newEmail,
                identityProviderId: sub as string,
            };
            Utils.validateRequestSchema(dto, sendAccountEmailUpdateEmailSchema);

            await sendAccountEmailUpdateEmailService.execute(dto);
        },
    },
    {
        path: "/accounts/send-password-recovery-email",
        method: "POST",
        successStatusCode: 204,
        handler: async (event): Promise<void> => {
            const { email } = event.body;

            const dto: SendPasswordRecoveryEmailDTO = {
                email,
            };
            Utils.validateRequestSchema(dto, sendPasswordRecoveryEmailSchema);

            await sendPasswordRecoveryEmailService.execute(dto);
        },
    },
    {
        path: "/accounts/email",
        method: "PATCH",
        successStatusCode: 204,
        handler: async (event): Promise<void> => {
            const { accessToken, code } = event.body;
            const { sub } = event.requestContext.authorizer.jwt.claims;

            const dto: UpdateAccountEmailDTO = {
                identityProviderId: sub as string,
                accessToken,
                code,
            };
            Utils.validateRequestSchema(dto, updateAccountEmailSchema);

            await updateAccountEmailService.execute(dto);
        },
    },
    {
        path: "/accounts/password",
        method: "PATCH",
        successStatusCode: 204,
        handler: async (event): Promise<void> => {
            const { newPassword } = event.body;
            const { sub } = event.requestContext.authorizer.jwt.claims;

            const dto: UpdateAccountPasswordDTO = {
                identityProviderId: sub as string,
                newPassword,
            };
            Utils.validateRequestSchema(dto, updateAccountPasswordSchema);

            await updateAccountPasswordService.execute(dto);
        },
    },
    {
        path: "/accounts/verify-email",
        method: "PATCH",
        successStatusCode: 204,
        handler: async (event): Promise<void> => {
            const { code, email } = event.body;

            const dto: VerifyAccountEmailDTO = {
                code,
                email,
            };
            Utils.validateRequestSchema(dto, verifyAccountEmailSchema);

            await verifyAccountEmailService.execute(dto);
        },
    },
]);

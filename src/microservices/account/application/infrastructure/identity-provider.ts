import crypto from "node:crypto";

import {
    ConflictedError,
    envs,
    InvalidParamError,
    NotFoundError,
    UnauthorizedError,
} from "@/shared";

import {
    CognitoIdentityProviderClient,
    SignUpCommand,
    InitiateAuthCommand,
    AdminDeleteUserCommand,
    AdminUpdateUserAttributesCommand,
    ForgotPasswordCommand,
    ConfirmForgotPasswordCommand,
    AdminSetUserPasswordCommand,
    ConfirmSignUpCommand,
    VerifyUserAttributeCommand,
    AdminGetUserCommand,
    SignUpCommandOutput,
    InitiateAuthCommandOutput,
    AdminGetUserCommandOutput,
    InvalidParameterException,
    InvalidPasswordException,
    ExpiredCodeException,
    UserNotFoundException,
    UsernameExistsException,
    CodeMismatchException,
    NotAuthorizedException,
    ResourceNotFoundException,
    AliasExistsException,
} from "@aws-sdk/client-cognito-identity-provider";
import { Command, MetadataBearer } from "@smithy/types";

export type OutputLoginDTO = {
    accessToken: string;
    refreshToken: string;
};

export type OutputAccountDTO = {
    accountId: string;
    identityProviderId: string;
    email: string;
};

export class IdentityProvider {
    private readonly client: CognitoIdentityProviderClient;

    constructor() {
        const credential = {
            accessKeyId: envs.awsAccessKeyId,
            secretAccessKey: envs.secretAccessKey,
        };
        this.client = new CognitoIdentityProviderClient({
            region: envs.awsRegion,
            credentials:
                envs.nodeEnv === "production" || envs.nodeEnv === "staging"
                    ? null
                    : credential,
        });
    }

    async createAccount(
        accountId: string,
        email: string,
        password: string,
    ): Promise<string> {
        const command = new SignUpCommand({
            ClientId: envs.awsCognitoClientId,
            SecretHash: this.calculateSecretHash(email),
            Username: email,
            Password: password,
            UserAttributes: [
                { Name: "custom:account_id", Value: accountId },
                { Name: "email", Value: email },
            ],
        });

        const response = await this.sendCommand<SignUpCommandOutput>(command);

        return response.UserSub;
    }

    async verifyEmail(email: string, code: string): Promise<void> {
        const command = new ConfirmSignUpCommand({
            ClientId: envs.awsCognitoClientId,
            SecretHash: this.calculateSecretHash(email),
            Username: email,
            ConfirmationCode: code,
        });

        await this.sendCommand(command);
    }

    async login(email: string, password: string): Promise<OutputLoginDTO> {
        const command = new InitiateAuthCommand({
            ClientId: envs.awsCognitoClientId,
            AuthFlow: "USER_PASSWORD_AUTH",
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password,
                SECRET_HASH: this.calculateSecretHash(email),
            },
        });

        const response =
            await this.sendCommand<InitiateAuthCommandOutput>(command);

        return {
            accessToken: response.AuthenticationResult.AccessToken,
            refreshToken: response.AuthenticationResult.RefreshToken,
        };
    }

    async getAccountInfo(
        identityProviderId: string,
    ): Promise<OutputAccountDTO | null> {
        try {
            const command = new AdminGetUserCommand({
                Username: identityProviderId,
                UserPoolId: envs.awsCognitoUserPoolId,
            });

            const response =
                await this.sendCommand<AdminGetUserCommandOutput>(command);

            const accountInfo = response.UserAttributes.reduce(
                (data, { Name, Value }) => ({
                    ...data,
                    [String(Name)]: Value,
                }),
                {},
            );

            return {
                accountId: accountInfo["custom:account_id"],
                identityProviderId: response.Username,
                email: accountInfo["email"],
            };
        } catch (e) {
            if (
                e instanceof UserNotFoundException ||
                e instanceof ResourceNotFoundException
            ) {
                return null;
            }
        }
    }

    async refreshToken(
        identityProviderId: string,
        refreshToken: string,
    ): Promise<string> {
        const command = new InitiateAuthCommand({
            ClientId: envs.awsCognitoClientId,
            AuthFlow: "REFRESH_TOKEN_AUTH",
            AuthParameters: {
                REFRESH_TOKEN: refreshToken,
                SECRET_HASH: this.calculateSecretHash(identityProviderId),
            },
        });

        const response =
            await this.sendCommand<InitiateAuthCommandOutput>(command);

        return response.AuthenticationResult.AccessToken;
    }

    async sendEmailEmailUpdate(email: string, newEmail: string): Promise<void> {
        const command = new AdminUpdateUserAttributesCommand({
            UserPoolId: envs.awsCognitoUserPoolId,
            Username: email,
            UserAttributes: [
                {
                    Name: "email",
                    Value: newEmail,
                },
            ],
        });

        await this.sendCommand(command);
    }

    async updateEmail(accessToken: string, code: string): Promise<void> {
        const command = new VerifyUserAttributeCommand({
            AccessToken: accessToken,
            AttributeName: "email",
            Code: code,
        });

        await this.sendCommand(command);
    }

    async updatePassword(
        identityProviderId: string,
        newPassword: string,
    ): Promise<void> {
        const command = new AdminSetUserPasswordCommand({
            UserPoolId: envs.awsCognitoUserPoolId,
            Username: identityProviderId,
            Password: newPassword,
            Permanent: true,
        });

        await this.sendCommand(command);
    }

    async sendRecoveryPasswordEmail(email: string): Promise<void> {
        const command = new ForgotPasswordCommand({
            ClientId: envs.awsCognitoClientId,
            SecretHash: this.calculateSecretHash(email),
            Username: email,
        });

        await this.sendCommand(command);
    }

    async recoveryPassword(
        email: string,
        code: string,
        newPassword: string,
    ): Promise<void> {
        const command = new ConfirmForgotPasswordCommand({
            ClientId: envs.awsCognitoClientId,
            SecretHash: this.calculateSecretHash(email),
            Username: email,
            ConfirmationCode: code,
            Password: newPassword,
        });

        await this.sendCommand(command);
    }

    async deleteAccount(email: string): Promise<void> {
        const command = new AdminDeleteUserCommand({
            UserPoolId: envs.awsCognitoUserPoolId,
            Username: email,
        });

        await this.sendCommand(command);
    }

    private async sendCommand<TOutput>(
        command: Command<
            object,
            object,
            MetadataBearer,
            MetadataBearer,
            unknown
        >,
    ): Promise<TOutput> {
        try {
            const result = await this.client.send(command);
            return result as TOutput;
        } catch (e) {
            console.error(e.message);

            if (
                e instanceof InvalidParameterException &&
                e.message.includes("email")
            ) {
                throw new InvalidParamError("O e-mail está inválido");
            }

            if (e instanceof InvalidPasswordException) {
                throw new InvalidParamError(
                    "A senha deve ter no mínimo 8 caracteres, conter pelo menos 1 número, 1 caractere especial, 1 letra maiúscula e 1 letra minúscula.",
                );
            }

            if (e instanceof CodeMismatchException) {
                throw new InvalidParamError("O código é inválido");
            }

            if (e instanceof ExpiredCodeException) {
                throw new InvalidParamError("O código está expirado");
            }

            if (
                e instanceof UserNotFoundException ||
                e instanceof ResourceNotFoundException
            ) {
                throw new NotFoundError("O usuário não foi encontrado");
            }

            if (
                e instanceof UsernameExistsException ||
                e instanceof AliasExistsException
            ) {
                throw new ConflictedError("Esse e-mail já está cadastrado");
            }

            if (e instanceof NotAuthorizedException) {
                throw new UnauthorizedError(
                    "Email ou senha incorreto(s) ou você não está logado",
                );
            }

            throw new Error(e.message);
        }
    }

    private calculateSecretHash(userInfo: string): string {
        const hmac = crypto.createHmac("sha256", envs.awsCognitoClientSecret);
        hmac.update(userInfo + envs.awsCognitoClientId);
        return hmac.digest("base64");
    }
}

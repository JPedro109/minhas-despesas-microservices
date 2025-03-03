import {
    AccountLoginService,
    CreateAccountService,
    DeleteAccountService,
    RecoveryPasswordService,
    RefreshAccountTokenService,
    SendAccountEmailUpdateEmailService,
    SendPasswordRecoveryEmailService,
    UpdateAccountEmailService,
    UpdateAccountPasswordService,
    VerifyAccountEmailService,
} from "../services";
import {
    accountConsentDAO,
    accountDAO,
    identityProvider,
    notification,
} from "./infrastructure";

// Account
export const accountLoginService = new AccountLoginService(identityProvider);
export const createAccountService = new CreateAccountService(
    accountDAO,
    accountConsentDAO,
    identityProvider,
    notification,
);
export const deleteAccountService = new DeleteAccountService(
    accountDAO,
    identityProvider,
    notification,
);
export const recoveryPasswordService = new RecoveryPasswordService(
    identityProvider,
);
export const refreshAccountTokenService = new RefreshAccountTokenService(
    identityProvider,
);
export const sendAccountEmailUpdateEmailService =
    new SendAccountEmailUpdateEmailService(identityProvider);
export const sendPasswordRecoveryEmailService =
    new SendPasswordRecoveryEmailService(identityProvider);
export const updateAccountEmailService = new UpdateAccountEmailService(
    identityProvider,
    notification,
);
export const updateAccountPasswordService = new UpdateAccountPasswordService(
    identityProvider,
);
export const verifyAccountEmailService = new VerifyAccountEmailService(
    identityProvider,
);

import {
    CreateAccountService,
    CreateProfileService,
    DeleteAccountService,
    GetProfileService,
    UpdateProfileService,
} from "../services";
import { accountDAO, profileDAO } from "./infrastructure";

// Account
export const createAccountService = new CreateAccountService(accountDAO);
export const deleteAccountService = new DeleteAccountService(accountDAO);

// Profile
export const createProfileService = new CreateProfileService(profileDAO);
export const getProfileService = new GetProfileService(profileDAO);
export const updateProfileService = new UpdateProfileService(profileDAO);

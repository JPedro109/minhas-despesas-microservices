import { Dynamo, envs, SNS } from "@/shared";
import {
    AccountConsentDAO,
    AccountDAO,
    IdentityProvider,
    Notification,
} from "../infrastructure";

const dynamo = new Dynamo(envs.accountTableName);
export const accountDAO = new AccountDAO(dynamo);
export const accountConsentDAO = new AccountConsentDAO(dynamo);

export const identityProvider = new IdentityProvider();

const sns = new SNS();
export const notification = new Notification(sns);

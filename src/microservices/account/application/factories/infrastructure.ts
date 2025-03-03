import { Dynamo, SNS } from "@/shared";
import {
    AccountConsentDAO,
    AccountDAO,
    IdentityProvider,
    Notification,
} from "../infrastructure";

const dynamo = new Dynamo("Account");
export const accountDAO = new AccountDAO(dynamo);
export const accountConsentDAO = new AccountConsentDAO(dynamo);

export const identityProvider = new IdentityProvider();

const sns = new SNS();
export const notification = new Notification(sns);

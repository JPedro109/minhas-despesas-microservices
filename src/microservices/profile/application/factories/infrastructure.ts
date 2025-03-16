import { Dynamo, envs } from "@/shared";
import { AccountDAO, ProfileDAO } from "../infrastructure";

const dynamo = new Dynamo(envs.profileTableName);
export const profileDAO = new ProfileDAO(dynamo);
export const accountDAO = new AccountDAO(dynamo);

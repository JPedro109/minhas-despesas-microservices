import { Dynamo } from "@/shared";
import { AccountDAO, ProfileDAO } from "../infrastructure";

const dynamo = new Dynamo("Profile");
export const profileDAO = new ProfileDAO(dynamo);
export const accountDAO = new AccountDAO(dynamo);

export const handler = (event, context): void => {
    event.response = {
        claimsAndScopeOverrideDetails: {
            accessTokenGeneration: {
                claimsToAddOrOverride: {
                    account_id:
                        event.request.userAttributes["custom:account_id"],
                },
            },
        },
    };

    context.done(null, event);
};

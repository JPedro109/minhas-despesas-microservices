export type AccountConsentDynamoModel = {
    AccountId: string;
    AccountConsentId: string;
    ConsentVersion: string;
    IpAddress: string;
    UserAgent: string;
    CreatedAt: Date;
};

export type AccountConsentModel = {
    accountId: string;
    accountConsentId: string;
    consentVersion: string;
    ipAddress: string;
    userAgent: string;
    createdAt: Date;
};

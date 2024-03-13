type SelfDestructingToken = {
    access_token: string,
    refresh_token: string, 
    timeout: NodeJS.Timeout,
};

export const currentDiscordTokens: Map<string, SelfDestructingToken> = new Map<string, SelfDestructingToken>();
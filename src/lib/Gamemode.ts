export const allGamemodes = ["survival", "creative", "adventure"] as const;
export type Gamemode = typeof allGamemodes[number];
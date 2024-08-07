import type Eris from 'eris';

enum ApplicationCommandType {
    ChatInput = 1,
    User = 2,
    Message = 3
}

export type SlashCommandListData = {
    type?: ApplicationCommandType;
    description: string;
};

export type SlashCommandData = {
    name: string;
};

export type SlashCommandDataResponse = {
    id: string;
    // biome-ignore lint/style/useNamingConvention:
    application_id: string;
    version: string;
    // biome-ignore lint/style/useNamingConvention:
    default_member_permissions: string;
    type: Eris.Constants['ApplicationCommandTypes'];
    name: string;
    description: string;
    // biome-ignore lint/style/useNamingConvention:
    dm_permission: boolean;
    contexts: string;
    // biome-ignore lint/style/useNamingConvention:
    integration_types: number[];
    nsfw: boolean;
};

export type CommandHashes = { [key: string]: string };

export interface IDeploymentDispatcher {
    refreshSlashCommands(): Promise<void>;
}

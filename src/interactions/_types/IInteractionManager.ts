import type { IShardClient } from '@core/_types/IShardClient';
import type { ILoggerService } from '@type/insights/ILoggerService';
import type { AutocompleteInteraction, CommandInteraction, ComponentInteraction, PingInteraction } from 'eris';

export enum MessageResponseFlags {
    Ephemeral = 64
}

export interface IInteractionManager {
    handleCommandInteraction(
        logger: ILoggerService,
        shardClient: IShardClient,
        interaction: CommandInteraction
    ): Promise<void>;
    handleAutocompleteInteraction(
        logger: ILoggerService,
        shardClient: IShardClient,
        interaction: AutocompleteInteraction
    ): Promise<void>;
    handleComponentInteraction(
        logger: ILoggerService,
        shardClient: IShardClient,
        interaction: ComponentInteraction
    ): Promise<void>;
    handlePingInteraction(
        logger: ILoggerService,
        shardClient: IShardClient,
        interaction: PingInteraction
    ): Promise<void>;
    loadInteractionHandlers(logger: ILoggerService, interactionsPath: string): void;
}

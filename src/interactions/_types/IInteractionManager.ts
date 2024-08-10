import type { IShardClient } from '@type/IShardClient';
import type { IPlayerService } from '@type/player/IPlayerService';
import type { ILoggerService } from '@type/insights/ILoggerService';
import type { AutocompleteInteraction, CommandInteraction, ComponentInteraction, PingInteraction } from 'eris';

export enum MessageResponseFlags {
    Ephemeral = 64
}

export interface IInteractionManager {
    handleCommandInteraction(
        logger: ILoggerService,
        shardClient: IShardClient,
        playerService: IPlayerService,
        interaction: CommandInteraction
    ): Promise<void>;
    handleAutocompleteInteraction(
        logger: ILoggerService,
        shardClient: IShardClient,
        playerService: IPlayerService,
        interaction: AutocompleteInteraction
    ): Promise<void>;
    handleComponentInteraction(
        logger: ILoggerService,
        shardClient: IShardClient,
        playerService: IPlayerService,
        interaction: ComponentInteraction
    ): Promise<void>;
    handlePingInteraction(
        logger: ILoggerService,
        shardClient: IShardClient,
        interaction: PingInteraction
    ): Promise<void>;
    loadInteractionHandlers(logger: ILoggerService, interactionsPath: string): void;
}

import type { ILoggerService } from '@type/insights/ILoggerService';
import type { IShardClient } from '@type/IShardClient';
import type { IPlayerService } from '@type/player/IPlayerService';
import type Eris from 'eris';
import type { CommandInteraction, Embed } from 'eris';
import type { ISlashCommandHook } from '@type/ISlashCommandHook';

export type SlashCommandData = {} & Omit<Eris.ChatInputApplicationCommand, 'application_id' | 'type' | 'id'>;

export interface ISlashCommand {
    data: SlashCommandData;
    usageEmbed?: Embed;
    hooks?: ISlashCommandHook[];
    run: (
        logger: ILoggerService,
        shardClient: IShardClient,
        playerService: IPlayerService,
        interaction: CommandInteraction
    ) => Promise<void>;
}

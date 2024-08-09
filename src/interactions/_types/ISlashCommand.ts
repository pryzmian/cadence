import type { IShardClient } from '@core/_types/IShardClient';
import type { ILoggerService } from '@type/insights/ILoggerService';
import type Eris from 'eris';
import type { CommandInteraction, Embed } from 'eris';

export type SlashCommandData = {} & Omit<Eris.ChatInputApplicationCommand, 'application_id' | 'type' | 'id'>;

export interface ISlashCommand {
    data: SlashCommandData;
    usageEmbed?: Embed;
    run: (logger: ILoggerService, shardClient: IShardClient, interaction: CommandInteraction) => Promise<void>;
}

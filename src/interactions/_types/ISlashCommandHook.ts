import type { IShardClient } from '@type/IShardClient';
import type { ILoggerService } from '@type/insights/ILoggerService';
import type { IPlayerService } from '@type/player/IPlayerService';
import type { CommandInteraction } from 'eris';

export interface ISlashCommandHook {
    beforeRun?: (
        logger: ILoggerService,
        shardClient: IShardClient,
        playerService: IPlayerService,
        interaction: CommandInteraction
    ) => Promise<boolean>;
    afterRun?: (
        logger: ILoggerService,
        shardClient: IShardClient,
        playerService: IPlayerService,
        interaction: CommandInteraction
    ) => Promise<boolean>;
}

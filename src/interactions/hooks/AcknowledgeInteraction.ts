import type { IShardClient } from '@core/_types/IShardClient';
import type { ILoggerService } from '@services/_types/insights/ILoggerService';
import type { IPlayerService } from '@services/_types/player/IPlayerService';
import type { ISlashCommandHook } from '@type/ISlashCommandHook';
import type { CommandInteraction } from 'eris';

export class AcknowledgeInteration implements ISlashCommandHook {
    public async beforeRun(
        logger: ILoggerService,
        _shardClient: IShardClient,
        _playerService: IPlayerService,
        interaction: CommandInteraction
    ) {
        if (interaction.acknowledged) {
            logger.debug('Interaction already acknowledged');
            return true;
        }

        await interaction.acknowledge();
        logger.debug('Interaction acknowledged');
        return true;
    }
}

export const acknowledgeInteraction = new AcknowledgeInteration();

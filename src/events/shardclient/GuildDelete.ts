import type { IShardClient } from '@core/_types/IShardClient';
import type { ILoggerService } from '@services/_types/insights/ILoggerService';
import type { IPlayerService } from '@services/_types/player/IPlayerService';
import type { IEventHandler } from '@type/IEventHandler';
import { ShardEvents } from '@type/IEventHandler';
import type { Guild } from 'eris';

export class GuildDeleteEventHandler implements IEventHandler {
    public name = ShardEvents.GuildDelete;
    public once = false;

    public async run(logger: ILoggerService, _shardClient: IShardClient, _playerService: IPlayerService, guild: Guild) {
        logger.info(`Event '${this.name}' received: Bot removed from guild with ID ${guild.id}.`);
    }
}

module.exports = new GuildDeleteEventHandler();

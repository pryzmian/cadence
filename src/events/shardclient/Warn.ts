import type { IShardClient } from '@core/_types/IShardClient';
import type { ILoggerService } from '@services/_types/insights/ILoggerService';
import type { IPlayerService } from '@services/_types/player/IPlayerService';
import type { IEventHandler } from '@type/IEventHandler';
import { ShardEvents } from '@type/IEventHandler';

export class WarnEventHandler implements IEventHandler {
    public name = ShardEvents.Warn;
    public once = false;

    public async run(
        logger: ILoggerService,
        _shardClient: IShardClient,
        _playerService: IPlayerService,
        message: string,
        shardId: number
    ) {
        logger.warn(message, `Event '${this.name}' received: Shard with ID ${shardId} received a warning message.`);
    }
}

module.exports = new WarnEventHandler();

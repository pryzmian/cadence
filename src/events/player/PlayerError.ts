import { PlayerEvents, type IEventHandler } from '@type/IEventHandler';
import type { ILoggerService } from '@type/insights/ILoggerService';
import type { IShardClient } from '@type/IShardClient';

export class PlayerErrorHandler implements IEventHandler {
    public name = PlayerEvents.PlayerError;
    public once = false;

    public async run(
        logger: ILoggerService,
        _shardClient: IShardClient,
        queue: unknown,
        error: Error
    ) {
        logger.error({ queue, error }, `Event '${this.name}' received: An error has occurred in the player.`);
    }
}

module.exports = new PlayerErrorHandler();

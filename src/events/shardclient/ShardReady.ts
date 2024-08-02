import type { IShardClient } from '@core/_types/IShardClient';
import type { ILoggerService } from '@services/_types/insights/ILoggerService';
import type { IEventHandler } from '@type/IEventHandler';
import { ShardEvents } from '@type/IEventHandler';

export class ShardReadyEventHandler implements IEventHandler {
    public name = ShardEvents.ShardReady;
    public once = false;

    public async run(logger: ILoggerService, _shardClient: IShardClient, shardId: number) {
        logger.info(`Event '${this.name}' received: Shard with ID ${shardId} is ready.`);
    }
}

module.exports = new ShardReadyEventHandler();

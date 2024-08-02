import type { IShardClient } from '@core/_types/IShardClient';
import type { ILoggerService } from '@services/_types/insights/ILoggerService';
import type { IEventHandler } from '@type/IEventHandler';
import { ShardEvents } from '@type/IEventHandler';

export class ShardResumeEventHandler implements IEventHandler {
    public name = ShardEvents.ShardResume;
    public once = false;

    public async run(logger: ILoggerService, _shardClient: IShardClient, shardId: number) {
        logger.info(`Event '${this.name}' received: Shard with ID ${shardId} has resumed.`);
    }
}

module.exports = new ShardResumeEventHandler();

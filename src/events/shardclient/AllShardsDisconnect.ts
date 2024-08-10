import type { IShardClient } from '@core/_types/IShardClient';
import type { ILoggerService } from '@services/_types/insights/ILoggerService';
import type { IPlayerService } from '@services/_types/player/IPlayerService';
import type { IEventHandler } from '@type/IEventHandler';
import { ShardClientEvents } from '@type/IEventHandler';

export class AllShardsDisconnectEventHandler implements IEventHandler {
    public name = ShardClientEvents.AllShardsDisconnect;
    public once = false;

    public async run(logger: ILoggerService, _shardClient: IShardClient, _playerService: IPlayerService) {
        logger.info(`Event '${this.name}' received: All shards for the worker is disconnected.`);
    }
}

module.exports = new AllShardsDisconnectEventHandler();

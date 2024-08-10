import type { IShardClient } from '@core/_types/IShardClient';
import type { ILoggerService } from '@services/_types/insights/ILoggerService';
import type { IPlayerService } from '@services/_types/player/IPlayerService';
import type { IEventHandler } from '@type/IEventHandler';
import { ShardClientEvents } from '@type/IEventHandler';
import { parentPort } from 'node:worker_threads';

export class AllShardsReadyEventHandler implements IEventHandler {
    public name = ShardClientEvents.AllShardsReady;
    public once = false;

    public async run(logger: ILoggerService, _shardClient: IShardClient, _playerService: IPlayerService) {
        logger.info(`Event '${this.name}' received: All shards for the worker is ready.`);

        parentPort?.postMessage('shardWorkerReady');
    }
}

module.exports = new AllShardsReadyEventHandler();

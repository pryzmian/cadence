import type { IShardClient } from '@core/_types/IShardClient';
import type { ILoggerService } from '@services/_types/insights/ILoggerService';
import type { IPlayerService } from '@services/_types/player/IPlayerService';
import type { IEventHandler } from '@type/IEventHandler';
import { ShardEvents } from '@type/IEventHandler';

export class HelloEventHandler implements IEventHandler {
    public name = ShardEvents.Hello;
    public once = false;

    public async run(
        logger: ILoggerService,
        _shardClient: IShardClient,
        _playerService: IPlayerService,
        trace: string[],
        shardId: number
    ) {
        logger.debug(trace, `Event '${this.name}' received: Shard with ID ${shardId} received an HELLO packet.`);
    }
}

module.exports = new HelloEventHandler();

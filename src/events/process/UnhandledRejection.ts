import { ProcessEvents, type IEventHandler } from '@type/IEventHandler';
import type { ILoggerService } from '@services/_types/insights/ILoggerService';
import type { IShardClient } from '@core/_types/IShardClient';
import type { IPlayerService } from '@services/_types/player/IPlayerService';

export class UnhandledRejectionEventHandler implements IEventHandler {
    public name = ProcessEvents.UnhandledRejection;
    public once = false;

    public async run(
        logger: ILoggerService,
        _shardClient: IShardClient,
        _playerService: IPlayerService,
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        reason: Error | any,
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        promise: Promise<any>
    ) {
        logger.error({ reason, promise }, `Event '${this.name}' received: An unhandled rejection has occurred.`);
    }
}

module.exports = new UnhandledRejectionEventHandler();

import { ProcessEvents, type IEventHandler } from '@type/IEventHandler';
import type { ILoggerService } from '@services/_types/insights/ILoggerService';
import type { IShardClient } from '@core/_types/IShardClient';
import type { IPlayerService } from '@services/_types/player/IPlayerService';

export class UncaughtExceptionEventHandler implements IEventHandler {
    public name = ProcessEvents.UncaughtException;
    public once = false;

    public async run(
        logger: ILoggerService,
        _shardClient: IShardClient,
        _playerService: IPlayerService,
        error: Error,
        origin: string
    ) {
        logger.error(error, `Event '${this.name}' received: An uncaught exception occurred in ${origin}.`);
    }
}

module.exports = new UncaughtExceptionEventHandler();

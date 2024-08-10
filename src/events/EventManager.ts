import type { IShardClient } from '@core/_types/IShardClient';
import type { IEventHandler } from '@type/IEventHandler';
import type { IEventManager } from '@type/IEventManager';
import type { ILoggerService } from '@type/insights/ILoggerService';
import type { IPlayerService } from '@type/player/IPlayerService';
import fs from 'node:fs';
import { join } from 'node:path';

export class EventManager implements IEventManager {
    private _logger: ILoggerService;
    private _shardClient: IShardClient;
    private _playerService: IPlayerService;
    private _eventsPath: string;
    private _fs: typeof fs;

    constructor(
        logger: ILoggerService,
        shardClient: IShardClient,
        playerService: IPlayerService,
        eventsPath: string,
        fileSystemModule = fs
    ) {
        this._logger = logger.updateContext({ module: 'events' });
        this._shardClient = shardClient;
        this._playerService = playerService;
        this._eventsPath = eventsPath;
        this._fs = fileSystemModule;
        this._setMaxListeners(this._shardClient.getShardCount());
        this._logger.debug(`Using path '${this._eventsPath}' for event handlers.`);
    }

    public loadEventHandlers(): void {
        const directoryContents: string[] = this._fs
            .readdirSync(this._eventsPath)
            .filter((file) => !file.endsWith('.js'));
        if (directoryContents.length === 0) {
            this._logger.error(`No event folders found in path: ${this._eventsPath}`);
            throw new Error(`No event folders found in path ${this._eventsPath}. Exiting...`); // move validation to corevalidator
        }

        for (const name of directoryContents) {
            switch (name) {
                case 'shardclient':
                    this._logger.debug(`Loading client event handlers from '${name}' directory`);
                    this._loadClientEventHandlers(join(this._eventsPath, name));
                    break;
                case 'player':
                    this._logger.debug(`Loading player event handlers from '${name}' directory`);
                    this._loadPlayerEventHandlers(join(this._eventsPath, name));
                    break;
                case 'process':
                    this._logger.debug(`Loading process event handlers from '${name}' directory`);
                    this._loadProcessEventHandlers(join(this._eventsPath, name));
                    break;
                default:
                    this._logger.debug(`Unknown event type folder: '${name}', ignoring...`);
                    break;
            }
        }
    }

    public reloadEventHandlers(): void {
        this._shardClient.removeAllListeners();
        this.loadEventHandlers();
        this._logger.debug('Event handlers reloaded.');
    }

    private _loadClientEventHandlers(folderPath: string): void {
        const eventHandlerModules = this._parseEventsFromFolder(folderPath);
        for (const eventHandler of eventHandlerModules) {
            this._shardClient.registerEventListener(eventHandler.name, eventHandler.once, (...args) => {
                eventHandler.run(
                    this._logger.updateContext({ module: 'events' }),
                    this._shardClient,
                    this._playerService,
                    ...args
                );
            });
        }
    }

    private _loadPlayerEventHandlers(_folderPath: string): void {
        this._logger.warn('Loading player event handlers is not implemented yet.');
        return;
    }

    private _loadProcessEventHandlers(folderPath: string): void {
        const eventHandlerModules = this._parseEventsFromFolder(folderPath);
        for (const eventHandler of eventHandlerModules) {
            eventHandler.once
                ? process.once(eventHandler.name, (...args) => {
                      eventHandler.run(
                          this._logger.updateContext({ module: 'events' }),
                          this._shardClient,
                          this._playerService,
                          ...args
                      );
                  })
                : process.on(eventHandler.name, (...args) => {
                      eventHandler.run(
                          this._logger.updateContext({ module: 'events' }),
                          this._shardClient,
                          this._playerService,
                          ...args
                      );
                  });
        }
    }

    private _parseEventsFromFolder(folderPath: string): IEventHandler[] {
        const eventHandlers: IEventHandler[] = [];
        const eventFiles = this._getEventFileNames(folderPath);
        for (const file of eventFiles) {
            const eventHandler: IEventHandler = require(join(folderPath, file));
            if (!eventHandler.name || !eventHandler.run) {
                this._logger.error(`Event handler '${file}' does not implement IEventHandler properly. Skipping...`);
                continue;
            }

            eventHandlers.push(eventHandler);
        }
        return eventHandlers;
    }

    private _getEventFileNames(folderPath: string): string[] {
        return this._fs.readdirSync(folderPath).filter((file) => file.endsWith('.js'));
    }

    private _setMaxListeners(maxListeners: number): void {
        this._shardClient.setMaxListeners(maxListeners);
        this._logger.debug(`Max listeners set to ${maxListeners}.`);
    }
}

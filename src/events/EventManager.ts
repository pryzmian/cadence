import { readdirSync } from 'node:fs';
import path, { join } from 'node:path';
import type { IEventHandler } from '@type/IEventHandler';
import type { IEventManager } from '@events/_types/IEventManager';
import type { ILoggerService } from '@type/insights/ILoggerService';
import type { ShardClient } from '@core/ShardClient';

export class EventManager implements IEventManager {
    private _logger: ILoggerService;
    private _shardClient: ShardClient;
    private _eventsPath: string;

    constructor(logger: ILoggerService, shardClient: ShardClient, eventsPath: string) {
        this._logger = logger.updateContext({ module: 'events' });
        this._shardClient = shardClient;
        this._eventsPath = eventsPath;
        this._setMaxListeners(this._shardClient.getShardCount());
        this._logger.debug(`Using path '${this._eventsPath}' for event handlers.`);
    }

    public loadEventHandlers(): void {
        const directoryContents: string[] = readdirSync(this._eventsPath).filter((file) => !file.endsWith('.js'));
        if (directoryContents.length === 0) {
            this._logger.error(`No event folders found in path: ${this._eventsPath}`);
            throw new Error(`No event folders found in path ${this._eventsPath}. Exiting...`); // move validation to corevalidator
        }

        for (const name of directoryContents) {
            switch (name) {
                case 'shardclient':
                    this._logger.debug(`Loading client event handlers from '${name}' directory`);
                    this._loadClientEventHandlers(path.join(this._eventsPath, name));
                    break;
                case 'player':
                    this._logger.debug(`Loading player event handlers from '${name}' directory`);
                    this._loadPlayerEventHandlers(path.join(this._eventsPath, name));
                    break;
                case 'process':
                    this._logger.debug(`Loading process event handlers from '${name}' directory`);
                    this._loadProcessEventHandlers(path.join(this._eventsPath, name));
                    break;
                default:
                    // Unknown folder, ignore
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
                eventHandler.run(this._logger.updateContext({ module: 'events' }), this._shardClient, ...args);
            });
        }
    }

    private _loadPlayerEventHandlers(_folderPath: string): void {
        this._logger.warn('Loading player event handlers is not implemented yet.');
        return;
        /*
        const eventHandlerModules = this._parseEventsFromFolder(folderPath);
        for (const eventHandler of eventHandlerModules) {
            // TODO: Register player event listeners
            this._playerService.registerEventListener(eventHandler.eventName, eventHandler.triggerOnce, (...args) => {
                eventHandler.handleEvent(this._logger.updateContext({ module: 'events' }), this._shardClient, ...args);
            });
        }
        */
    }

    private _loadProcessEventHandlers(folderPath: string): void {
        const eventHandlerModules = this._parseEventsFromFolder(folderPath);
        for (const eventHandler of eventHandlerModules) {
            eventHandler.once
                ? process.once(eventHandler.name, (...args) => {
                      eventHandler.run(this._logger.updateContext({ module: 'events' }), this._shardClient, ...args);
                  })
                : process.on(eventHandler.name, (...args) => {
                      eventHandler.run(this._logger.updateContext({ module: 'events' }), this._shardClient, ...args);
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
        return readdirSync(folderPath).filter((file) => file.endsWith('.js'));
    }

    private _setMaxListeners(maxListeners: number): void {
        this._shardClient.setMaxListeners(maxListeners);
        this._logger.debug(`Max listeners set to ${maxListeners}.`);
    }
}

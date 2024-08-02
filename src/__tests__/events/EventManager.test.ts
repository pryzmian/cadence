import { EventManager } from '@events/EventManager';
import { MockLoggerService } from '@mocks/MockLoggerService';
import type { ILoggerService } from '@type/insights/ILoggerService';
import type { ShardClient } from '@core/ShardClient';
import type { IEventHandler } from '@type/IEventHandler';
import fs from 'node:fs';
import path, { join } from 'node:path';

let eventsPath = join(__dirname, '..', '_mocks', 'events');

const fsMock = {
    ...(jest.createMockFromModule('fs') as typeof fs),
    mockClear: jest.fn() as jest.Mock,
    readdirSync: jest.fn((dirPath: string) => {
        if (dirPath === eventsPath) {
            return ['shardclient', 'player', 'process'];
        }
    }) as jest.Mock
};

describe('EventManager', () => {
    let eventManager: EventManager;
    let mockLoggerService: ILoggerService;
    let mockShardClient: ShardClient;

    beforeEach(() => {
        mockLoggerService = new MockLoggerService();
        mockShardClient = {
            getShardCount: jest.fn().mockReturnValue(5),
            registerEventListener: jest.fn(),
            removeAllListeners: jest.fn(),
            setMaxListeners: jest.fn()
        } as unknown as ShardClient;
        fsMock.readdirSync.mockClear();
        fsMock.readdirSync.mockReturnValue(['shardclient', 'player', 'process']);
        eventManager = new EventManager(mockLoggerService, mockShardClient, eventsPath, fsMock);

        jest.spyOn(process, 'on').mockImplementation(jest.fn());
        jest.spyOn(process, 'once').mockImplementation(jest.fn());
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it('should initialize with provided file system module', () => {
        const eventManager = new EventManager(mockLoggerService, mockShardClient, eventsPath, fsMock);
        expect(mockLoggerService.updateContext).toHaveBeenCalledWith({ module: 'events' });
        expect(mockLoggerService.debug).toHaveBeenCalledWith(`Using path '${eventsPath}' for event handlers.`);
        expect(eventManager['_fs']).toBe(fsMock);
    });

    describe('loadEventHandlers', () => {
        it('should load all client event handlers', () => {
            eventManager.loadEventHandlers();
            expect(mockLoggerService.debug).toHaveBeenCalledWith(
                "Loading client event handlers from 'shardclient' directory"
            );
        });

        it('should throw an error if no event folders are found', () => {
            fsMock.readdirSync.mockReturnValue([]);
            expect(() => eventManager.loadEventHandlers()).toThrowError(
                `No event folders found in path ${eventsPath}. Exiting...`
            );
        });

        it('should log a debug message for unknown event type folders', () => {
            const unknownFolder = 'unknown';
            fsMock.readdirSync.mockReturnValue(['shardclient', 'player', 'process', unknownFolder]);

            eventManager.loadEventHandlers();

            expect(mockLoggerService.debug).toHaveBeenCalledWith(
                `Unknown event type folder: '${unknownFolder}', ignoring...`
            );
        });
    });

    describe('reloadEventHandlers', () => {
        it('should reload event handlers', () => {
            eventManager.reloadEventHandlers();
            expect(mockShardClient.removeAllListeners).toHaveBeenCalled();
            expect(mockLoggerService.debug).toHaveBeenCalledWith('Event handlers reloaded.');
        });
    });

    describe('loadClientEventHandlers', () => {
        it('should load client event handlers', () => {
            const mockEventHandler: IEventHandler = {
                name: 'testEvent',
                once: false,
                run: jest.fn()
            };

            jest.spyOn(eventManager as any, '_parseEventsFromFolder').mockReturnValue([mockEventHandler]);

            eventManager['_loadClientEventHandlers']('mockFolderPath');

            // Check that the event listener was registered
            expect(mockShardClient.registerEventListener).toHaveBeenCalledWith(
                mockEventHandler.name,
                mockEventHandler.once,
                expect.any(Function)
            );

            // Trigger the event listener and check that eventHandler.run was called
            const eventListener = (mockShardClient.registerEventListener as jest.Mock).mock.calls[0][2];
            const args = ['arg1', 'arg2'];
            eventListener(...args);

            expect(mockEventHandler.run).toHaveBeenCalledWith(mockLoggerService, mockShardClient, ...args);
        });
    });

    describe('loadProcessEventHandlers', () => {
        it('should load process event handlers with process.on', () => {
            const mockEventHandler: IEventHandler = {
                name: 'testEvent',
                once: false,
                run: jest.fn()
            };

            jest.spyOn(eventManager as any, '_parseEventsFromFolder').mockReturnValue([mockEventHandler]);

            jest.spyOn(mockLoggerService, 'updateContext').mockReturnValue(mockLoggerService);

            eventManager['_loadProcessEventHandlers']('mockFolderPath');

            // Check that the process.on event listener was registered
            expect(process.on).toHaveBeenCalledWith(mockEventHandler.name, expect.any(Function));

            // Trigger the process.on event listener and check that eventHandler.run was called
            const eventListener = (process.on as jest.Mock).mock.calls[0][1];
            const args = ['arg1', 'arg2'];
            eventListener(...args);

            expect(mockEventHandler.run).toHaveBeenCalledWith(mockLoggerService, mockShardClient, ...args);
        });

        it('should load process event handlers with process.once', () => {
            const mockEventHandler: IEventHandler = {
                name: 'testEvent',
                once: true,
                run: jest.fn()
            };

            jest.spyOn(eventManager as any, '_parseEventsFromFolder').mockReturnValue([mockEventHandler]);

            jest.spyOn(mockLoggerService, 'updateContext').mockReturnValue(mockLoggerService);

            eventManager['_loadProcessEventHandlers']('mockFolderPath');

            // Check that the process.once event listener was registered
            expect(process.once).toHaveBeenCalledWith(mockEventHandler.name, expect.any(Function));

            // Trigger the process.once event listener and check that eventHandler.run was called
            const eventListener = (process.once as jest.Mock).mock.calls[0][1];
            const args = ['arg1', 'arg2'];
            eventListener(...args);

            expect(mockEventHandler.run).toHaveBeenCalledWith(mockLoggerService, mockShardClient, ...args);
        });
    });

    describe('parseEventsFromFolder', () => {
        it('should parse event handlers from folder', () => {
            const mockEventHandler: IEventHandler = {
                name: 'testEvent',
                once: false,
                run: jest.fn()
            };

            jest.spyOn(eventManager as any, '_getEventFileNames').mockReturnValue(['file1', 'file2']);

            jest.doMock(path.join('mockFolderPath', 'file1'), () => mockEventHandler, { virtual: true });
            jest.doMock(path.join('mockFolderPath', 'file2'), () => ({}), { virtual: true });

            const eventHandlers = eventManager['_parseEventsFromFolder']('mockFolderPath');

            expect(mockLoggerService.error).toHaveBeenCalledWith(
                "Event handler 'file2' does not implement IEventHandler properly. Skipping..."
            );
            expect(eventHandlers).toContain(mockEventHandler);
        });
    });

    describe('setMaxListeners', () => {
        it('should set max listeners on shard client', () => {
            expect(mockShardClient.setMaxListeners).toHaveBeenCalledWith(5);
            expect(mockLoggerService.debug).toHaveBeenCalledWith('Max listeners set to 5.');
        });
    });
});

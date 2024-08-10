import type { IShardClient } from '@core/_types/IShardClient';
import { InteractionManager } from '@interactions/InteractionManager';
import { MockLoggerService } from '@mocks/MockLoggerService';
import { IPlayerService } from '@services/_types/player/IPlayerService';
import { MessageResponseFlags } from '@type/IInteractionManager';
import type { ILoggerService } from '@type/insights/ILoggerService';
import type { AutocompleteInteraction, CommandInteraction, ComponentInteraction, PingInteraction } from 'eris';
import Eris from 'eris';
import fs from 'node:fs';
import path, { join } from 'node:path';

let interactionsPath = join(__dirname, '..', '_mocks', 'interactions');

const fsMock = {
    ...(jest.createMockFromModule('fs') as typeof fs),
    mockClear: jest.fn() as jest.Mock,
    readdirSync: jest.fn((dirPath: string) => {
        if (dirPath === interactionsPath) {
            return ['slashcommand', 'autocomplete', 'component'];
        }
    }) as jest.Mock
};

describe('InteractionManager', () => {
    let interactionManager: InteractionManager;
    let mockLoggerService: ILoggerService;
    let mockShardClient: IShardClient;
    let mockPlayerService: IPlayerService;
    let mockCommandInteraction: CommandInteraction;
    let mockAutocompleteInteraction: AutocompleteInteraction;
    let mockComponentInteraction: ComponentInteraction;
    let mockPingInteraction: PingInteraction;

    beforeEach(() => {
        mockLoggerService = new MockLoggerService();
        mockShardClient = {
            getShardId: jest.fn().mockReturnValue(0)
        } as unknown as IShardClient;
        mockPlayerService = {} as IPlayerService;
        fsMock.readdirSync.mockClear();
        fsMock.readdirSync.mockReturnValue(['slashcommand', 'autocomplete', 'component']);
        interactionManager = new InteractionManager(mockLoggerService, interactionsPath, fsMock);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it('should initialize with provided file system module', () => {
        const interactionManager = new InteractionManager(mockLoggerService, interactionsPath, fsMock);
        expect(mockLoggerService.updateContext).toHaveBeenCalledWith({ module: 'interactions' }, false);
        expect(mockLoggerService.debug).toHaveBeenCalledWith(
            `Using path '${interactionsPath}' for interaction handlers.`
        );
        expect(interactionManager['_fs']).toBe(fsMock);
    });

    describe('loadInteractionHandlers', () => {
        it('should load all slash command interaction handlers', () => {
            interactionManager.loadInteractionHandlers();
            expect(mockLoggerService.debug).toHaveBeenCalledWith(
                "Loading slash command interaction handlers from 'slashcommand' directory"
            );
        });

        it('should throw an error if no interaction folders are found', () => {
            fsMock.readdirSync.mockReturnValue([]);
            expect(() => interactionManager.loadInteractionHandlers()).toThrowError(
                `No interaction folders found in path ${interactionsPath}. Exiting...`
            );
        });

        it('should log a debug message for unknown interaction type folders', () => {
            const unknownFolder = 'unknown';
            fsMock.readdirSync.mockReturnValue(['slashcommand', 'autocomplete', 'component', unknownFolder]);

            interactionManager.loadInteractionHandlers();

            expect(mockLoggerService.debug).toHaveBeenCalledWith(
                `Unknown interaction type folder: '${unknownFolder}', ignoring...`
            );
        });
    });

    describe('handleCommandInteraction', () => {
        beforeEach(() => {
            mockCommandInteraction = {
                data: { name: 'testCommand', description: 'testDescription' },
                createMessage: jest.fn()
            } as unknown as CommandInteraction;
        });

        it('should handle command interaction', async () => {
            const mockSlashCommand = {
                data: { name: 'testCommand', description: 'testDescription' },
                run: jest.fn()
            };
            interactionManager['_slashCommands'].set('testCommand', mockSlashCommand);

            await interactionManager.handleCommandInteraction(
                mockLoggerService,
                mockShardClient,
                mockPlayerService,
                mockCommandInteraction
            );
            expect(mockSlashCommand.run).toHaveBeenCalled();
        });

        it('should log no handler found when no command handler is returned', async () => {
            mockCommandInteraction = {
                data: { name: 'unknown' },
                createMessage: jest.fn()
            } as unknown as CommandInteraction;

            await interactionManager.handleCommandInteraction(
                mockLoggerService,
                mockShardClient,
                mockPlayerService,
                mockCommandInteraction
            );

            expect(mockLoggerService.debug).toHaveBeenCalledWith(`No command handler found for 'unknown'`);
            expect(mockCommandInteraction.createMessage).toHaveBeenCalledWith({
                content: 'No command handler found for this command.',
                flags: MessageResponseFlags.Ephemeral
            });
        });

        it('should load slash command interaction handlers', () => {
            const mockSlashCommand = {
                data: { name: 'testCommand', description: 'testDescription' },
                run: jest.fn()
            };

            jest.spyOn(interactionManager as any, '_getInteractionFileNames').mockReturnValue(['file1', 'file2']);

            jest.doMock(path.join('mockFolderPath', 'file1'), () => mockSlashCommand, { virtual: true });
            jest.doMock(path.join('mockFolderPath', 'file2'), () => ({}), { virtual: true });

            interactionManager['_loadSlashCommandInteractionHandlers']('mockFolderPath');

            expect(mockLoggerService.error).toHaveBeenCalledWith(
                "Slash command 'file2' does not implement ISlashCommand properly. Skipping..."
            );
            expect(mockLoggerService.debug).toHaveBeenCalledWith("Slash command 'testCommand' loaded.");
            expect(interactionManager['_slashCommands'].get('testCommand')).toBe(mockSlashCommand);
        });
    });

    describe('handleAutocompleteInteraction', () => {
        beforeEach(() => {
            mockAutocompleteInteraction = {
                data: { name: 'testAutocomplete', description: 'testDescription' },
                result: jest.fn()
            } as unknown as AutocompleteInteraction;
        });

        it('should handle autocomplete interaction', async () => {
            const mockAutocompleteCommand = {
                data: { name: 'testAutocomplete', description: 'testDescription' },
                run: jest.fn()
            };
            interactionManager['_autocompleteCommands'].set('testAutocomplete', mockAutocompleteCommand);

            await interactionManager.handleAutocompleteInteraction(
                mockLoggerService,
                mockShardClient,
                mockPlayerService,
                mockAutocompleteInteraction
            );
            expect(mockAutocompleteCommand.run).toHaveBeenCalled();
        });

        it('should log no handler found when no autocomplete handler is returned', async () => {
            mockAutocompleteInteraction = {
                data: { name: 'unknown' },
                result: jest.fn()
            } as unknown as AutocompleteInteraction;

            await interactionManager.handleAutocompleteInteraction(
                mockLoggerService,
                mockShardClient,
                mockPlayerService,
                mockAutocompleteInteraction
            );

            expect(mockLoggerService.debug).toHaveBeenCalledWith(`No autocomplete command handler found for 'unknown'`);
            expect(mockAutocompleteInteraction.result).toHaveBeenCalledWith([
                {
                    name: `name: unknown`,
                    value: `value: unknown`
                }
            ]);
        });

        it('should load autocomplete command interaction handlers', () => {
            const mockAutocompleteCommand = {
                data: { name: 'testAutocomplete', description: 'testDescription' },
                run: jest.fn()
            };

            jest.spyOn(interactionManager as any, '_getInteractionFileNames').mockReturnValue(['file1', 'file2']);

            jest.doMock(path.join('mockFolderPath', 'file1'), () => mockAutocompleteCommand, { virtual: true });
            jest.doMock(path.join('mockFolderPath', 'file2'), () => ({}), { virtual: true });

            interactionManager['_loadAutocompleteInteractionHandlers']('mockFolderPath');

            expect(mockLoggerService.error).toHaveBeenCalledWith(
                "Autocomplete command 'file2' does not implement IAutocompleteCommand properly. Skipping..."
            );
            expect(mockLoggerService.debug).toHaveBeenCalledWith("Autocomplete command 'testAutocomplete' loaded.");
            expect(interactionManager['_autocompleteCommands'].get('testAutocomplete')).toBe(mockAutocompleteCommand);
        });
    });

    describe('handleComponentInteraction', () => {
        beforeEach(() => {
            mockComponentInteraction = {
                data: { custom_id: 'testComponent', component_type: Eris.Constants.ComponentTypes.BUTTON },
                createMessage: jest.fn()
            } as unknown as ComponentInteraction;
        });

        it('should handle component interaction', async () => {
            const mockComponent = {
                data: { custom_id: 'testComponent', component_type: Eris.Constants.ComponentTypes.BUTTON },
                run: jest.fn()
            };
            interactionManager['_components'].set('testComponent', mockComponent);

            await interactionManager.handleComponentInteraction(
                mockLoggerService,
                mockShardClient,
                mockPlayerService,
                mockComponentInteraction
            );
            expect(mockComponent.run).toHaveBeenCalled();
        });

        it('should log no handler found when no component handler is returned', async () => {
            mockComponentInteraction = {
                data: { custom_id: 'unknown' },
                createMessage: jest.fn()
            } as unknown as ComponentInteraction;

            await interactionManager.handleComponentInteraction(
                mockLoggerService,
                mockShardClient,
                mockPlayerService,
                mockComponentInteraction
            );

            expect(mockLoggerService.debug).toHaveBeenCalledWith(`No component handler found for 'unknown'`);
            expect(mockComponentInteraction.createMessage).toHaveBeenCalledWith({
                content: 'No component handler found for this command.',
                flags: MessageResponseFlags.Ephemeral
            });
        });

        it('should load component interaction handlers', () => {
            const mockComponent = {
                data: { custom_id: 'testComponent', component_type: Eris.Constants.ComponentTypes.BUTTON },
                run: jest.fn()
            };

            jest.spyOn(interactionManager as any, '_getInteractionFileNames').mockReturnValue(['file1', 'file2']);

            jest.doMock(path.join('mockFolderPath', 'file1'), () => mockComponent, { virtual: true });
            jest.doMock(path.join('mockFolderPath', 'file2'), () => ({}), { virtual: true });

            interactionManager['_loadComponentInteractionHandlers']('mockFolderPath');

            expect(mockLoggerService.error).toHaveBeenCalledWith(
                "Component 'file2' does not implement IMessageComponent properly. Skipping..."
            );
            expect(mockLoggerService.debug).toHaveBeenCalledWith("Component 'testComponent' loaded.");
            expect(interactionManager['_components'].get('testComponent')).toBe(mockComponent);
        });
    });

    describe('handlePingInteraction', () => {
        beforeEach(() => {
            mockPingInteraction = {
                id: 'testPing',
                pong: jest.fn()
            } as unknown as PingInteraction;
        });

        it('should handle ping interaction', async () => {
            await interactionManager.handlePingInteraction(mockLoggerService, mockShardClient, mockPingInteraction);
            expect(mockPingInteraction.pong).toHaveBeenCalled();
        });
    });
});

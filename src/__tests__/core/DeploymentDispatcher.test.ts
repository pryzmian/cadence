import { DeploymentDispatcher } from '@core/DeploymentDispatcher';
import { MockLoggerService } from '@mocks/MockLoggerService';
import fs from 'node:fs/promises';

jest.mock('node:fs/promises');
global.fetch = jest.fn();

describe('DeploymentDispatcher', () => {
    let deploymentDispatcher: DeploymentDispatcher;
    let mockLoggerService: MockLoggerService;

    beforeEach(() => {
        mockLoggerService = new MockLoggerService();
        deploymentDispatcher = new DeploymentDispatcher(
            mockLoggerService,
            '/mock/path/slashcommands',
            '/mock/path/hashes.json'
        );
        deploymentDispatcher['importCommand'] = jest.fn().mockImplementation((filePath) => {
            if (filePath.includes('command1.js')) {
                return Promise.resolve({ data: { name: 'command1', description: 'Description 1' } });
            }
            if (filePath.includes('invalidCommand.js')) {
                return Promise.resolve(undefined);
            }
            return Promise.resolve(undefined);
        });

        (fs.readdir as jest.Mock).mockResolvedValue(['command1.js', 'invalidCommand.js']);
        (global.fetch as jest.Mock).mockImplementation(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ message: 'Success' })
            })
        );
    });

    it('loads slash commands successfully', async () => {
        await deploymentDispatcher.refreshSlashCommands();
        expect(deploymentDispatcher['_slashCommands']).toHaveLength(1);
        expect(global.fetch).toHaveBeenCalled();
    });

    it('handles errors when loading commands with invalid data', async () => {
        await deploymentDispatcher.refreshSlashCommands();
        expect(mockLoggerService.error).toHaveBeenCalledWith(
            "Invalid slash command in 'invalidCommand.js'. Skipping..."
        );
    });

    it('logs information when there are no slash commands to deploy', async () => {
        deploymentDispatcher['generateCommandHashes'] = jest.fn().mockReturnValue({ command1: 'hash1' });
        deploymentDispatcher['loadCommandHashes'] = jest.fn().mockResolvedValue({ command1: 'hash1' });
        deploymentDispatcher['_slashCommands'].push({
            data: { name: 'command1', description: 'Description 1' },
            run: jest.fn()
        });

        await deploymentDispatcher['deploySlashCommandsIfNeeded']();

        expect(mockLoggerService.info).toHaveBeenCalledWith('No slash commands to deploy.');
    });

    it('logs an error when deployment fails', async () => {
        const mockCommand = {
            data: { name: 'testCommand', description: 'This should fail' },
            run: jest.fn()
        };

        (global.fetch as jest.Mock).mockImplementation(() =>
            Promise.resolve({
                ok: false,
                json: () => Promise.resolve({ error: 'Deployment failed due to server error' })
            })
        );

        await deploymentDispatcher['deployCommand'](mockCommand);

        expect(global.fetch).toHaveBeenCalled();
        expect(mockLoggerService.error).toHaveBeenCalledWith(
            { error: 'Deployment failed due to server error' },
            `Failed to deploy 'testCommand'.`
        );
    });

    it('logs an error when mkdir fails', async () => {
        const testHashes = { command1: 'hash1' };

        (fs.mkdir as jest.Mock).mockRejectedValue(new Error('Failed to create directory'));

        await deploymentDispatcher['saveCommandHashes'](testHashes);

        expect(mockLoggerService.error).toHaveBeenCalledWith(
            new Error('Failed to create directory'),
            'Failed to save command hashes.'
        );
    });

    it('logs an error when writeFile fails', async () => {
        const testHashes = { command1: 'hash1' };

        (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
        (fs.writeFile as jest.Mock).mockRejectedValue(new Error('Failed to write file'));

        await deploymentDispatcher['saveCommandHashes'](testHashes);

        expect(mockLoggerService.error).toHaveBeenCalledWith(
            new Error('Failed to write file'),
            'Failed to save command hashes.'
        );
    });

    it('successfully imports a command module', async () => {
        jest.mock(
            '/mock/path/slashcommands/command1.js',
            () => ({
                data: { name: 'testCommand', description: 'This should fail' },
                run: jest.fn()
            }),
            { virtual: true }
        );

        deploymentDispatcher = new DeploymentDispatcher(
            mockLoggerService,
            '/mock/path/slashcommands',
            '/mock/path/hashes.json'
        );

        const command = await deploymentDispatcher['importCommand']('/mock/path/slashcommands/command1.js');
        expect(command).toEqual({
            data: { name: 'testCommand', description: 'This should fail' },
            run: expect.any(Function)
        });
    });

    it('handles error during command module import', async () => {
        const mockImportError = new Error('Module not found');
        const errorFilePath = '/mock/path/slashcommands/badcommand.js';

        jest.isolateModules(() => {
            jest.doMock(
                errorFilePath,
                () => {
                    throw mockImportError;
                },
                { virtual: true }
            );
        });

        jest.isolateModules(async () => {
            const dispatcher = new DeploymentDispatcher(
                mockLoggerService,
                '/mock/path/slashcommands',
                '/mock/path/hashes.json'
            );

            const command = await dispatcher['importCommand'](errorFilePath);
            expect(command).toBeUndefined();
            expect(mockLoggerService.error).toHaveBeenCalledWith(
                `Error loading command from file '${errorFilePath}': ${mockImportError.toString()}`
            );
        });
    });

    it('imports a module that explicitly has no default export', async () => {
        const moduleWithoutDefault = {
            __esModule: true,
            data: { name: 'testCommandNoDefault', description: 'Module without default export' },
            execute: jest.fn()
        };

        jest.mock(
            '/mock/path/slashcommands/commandNoDefault.js',
            () => ({
                ...moduleWithoutDefault
            }),
            { virtual: true }
        );

        const dispatcher = new DeploymentDispatcher(
            mockLoggerService,
            '/mock/path/slashcommands',
            '/mock/path/hashes.json'
        );

        const command = await dispatcher['importCommand']('/mock/path/slashcommands/commandNoDefault.js');
        expect(command).toEqual(moduleWithoutDefault);
    });
});

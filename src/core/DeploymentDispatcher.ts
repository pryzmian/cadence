import type { IDeploymentDispatcher, SlashCommandDataResponse } from '@type/IDeploymentDispatcher';
import type { ILoggerService } from '@type/insights/ILoggerService';
import type { ISlashCommand } from '@type/ISlashCommand';
import { dirname, join } from 'node:path';
import { createHash } from 'node:crypto';
import { writeFile, readFile, readdir, mkdir } from 'node:fs/promises';

export class DeploymentDispatcher implements IDeploymentDispatcher {
    private _logger: ILoggerService;
    private _slashCommands: ISlashCommand[] = [];
    private _slashCommandsPath: string;
    private _baseUrl: string;
    private _applicationId = process.env.DISCORD_APPLICATION_ID ?? '0';
    private _token = process.env.DISCORD_BOT_TOKEN ?? '';
    private _slashCommandsHashPath: string;

    constructor(logger: ILoggerService, interactionsPath: string, slashCommandsHashPath: string, discordApiBaseUrl = 'https://discord.com/api/v10') {
        this._logger = logger;
        this._slashCommandsPath = join(interactionsPath, 'slashcommand');
        this._slashCommandsHashPath = slashCommandsHashPath;
        this._baseUrl = `${discordApiBaseUrl}/applications`;
    }

    public async refreshSlashCommands(): Promise<void> {
        await this._loadSlashCommands(this._slashCommandsPath);
        const commandsString = this._slashCommands.map((command) => `'/${command.data.name}'`).join(', ');

        this._logger.info(`Checking slash commands for deployment: ${commandsString}`);
        await this._deploySlashCommands();
    }

    public async deleteSlashCommands(): Promise<void> {
        const registeredCommands = await this.getRegisteredSlashCommands();
        if (registeredCommands.length === 0) {
            this._logger.debug('No slash commands to delete.');
            return;
        }
        for (const registeredCommand of registeredCommands) {
            const url = `${this._baseUrl}/${this._applicationId}/commands/${registeredCommand.id}`;
            this._logger.debug(`Deleting slash command '${registeredCommand.name}' with url '${url}'...`);
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    // biome-ignore lint/style/useNamingConvention:
                    Authorization: `Bot ${this._token}`
                }
            });

            if (response.status !== 204 && response.status !== 200) {
                this._logger.error(response.json(), 'Failed to delete slash command.');
            }

            this._logger.debug('Successfully deleted slash command.');
        }

        const registeredCommandsAfterDeletion = await this.getRegisteredSlashCommands();
        if (registeredCommandsAfterDeletion.length === 0) {
            this._logger.debug('No slash commands left after deletion.');
        } else {
            this._logger.debug(registeredCommandsAfterDeletion, 'Commands left after deletion:');
        }

        return;
    }

    public async getRegisteredSlashCommands(): Promise<SlashCommandDataResponse[]> {
        const url = `${this._baseUrl}/${this._applicationId}/commands`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // biome-ignore lint/style/useNamingConvention:
                Authorization: `Bot ${this._token}`
            }
        });

        if (!response.ok) {
            this._logger.error(response.json(), 'Failed to fetch registered slash commands.');
        }

        const data = await response.json();
        if (data.length === 0) {
            this._logger.debug('No slash commands registered.');
            return [];
        }
        this._logger.debug(data, 'Successfully fetched registered slash commands:');
        return data;
    }

    private async _loadSlashCommands(folderPath: string): Promise<void> {
        const slashCommands: ISlashCommand[] = [];
        const slashCommandFiles = (await readdir(folderPath)).filter((file) => file.endsWith('.js'));
        for (const file of slashCommandFiles) {
            const slashCommand: ISlashCommand = require(join(folderPath, file));
            if (!slashCommand.data.name || !slashCommand.data.description) {
                this._logger.error(`Slash command '${file}' is not valid. Skipping...`);
                continue;
            }
            slashCommands.push(slashCommand);
        }
        this._logger.debug(slashCommands, `Loaded ${slashCommands.length} slash commands from files in '${folderPath}'.`);
        this._slashCommands = slashCommands;
    }

    private async _deploySlashCommands(): Promise<void> {
        // PUT = DELETE ALL, then CREATE - Overwrite whole list of application commands, even deleting other commands
        // POST = UPSERT - Create new commands, or update existing commands, does not touch other commands

        const commands: ISlashCommand[] = this._slashCommands;
        const newHashes: { [key: string]: string } = {};
        const oldCommandHashes = await this.loadCommandHashes();

        const commandsToDeploy: ISlashCommand[] = [];
        for (const command of commands) {
            const hash = this._hashSlashCommand(command);
            newHashes[command.data.name] = hash;

            if (oldCommandHashes[command.data.name] !== hash) {
                this._logger.debug(`Updated slash command data for '${command.data.name}' detected. Old hash: ${oldCommandHashes[command.data.name]}, new hash: ${hash}`);
                commandsToDeploy.push(command);
            }
        }

        if (commandsToDeploy.length === 0) {
            this._logger.info('No slash commands to deploy.');
            return;
        }

        this._logger.info(`Deploying updated slash commands: ${commandsToDeploy.map((command) => `/${command.data.name}`).join(', ')}...`);
        for (const slashCommand of commandsToDeploy) {
            this._logger.debug(`Deploying slash command '${slashCommand.data.name}'...`);

            const url = `${this._baseUrl}/${this._applicationId}/commands`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // biome-ignore lint/style/useNamingConvention:
                    Authorization: `Bot ${this._token}`
                },
                body: JSON.stringify({ ...slashCommand.data })
            });

            if (!response.ok) {
                this._logger.error(response.json(), 'Failed to deploy slash command.');
            }

            const data = await response.json();
            this._logger.debug(data, `Successfully deployed slash command '${slashCommand.data.name}', response:`);
        }

        await this._saveCommandHashes(newHashes);
    }

    public async loadCommandHashes(): Promise<{ [key: string]: string }> {
        try {
            const data = await readFile(this._slashCommandsHashPath, { encoding: 'utf8' });
            const hashes = JSON.parse(data);
            this._logger.debug(hashes, `Loaded slash commands hashes from '${this._slashCommandsHashPath}':`);
            return hashes;
        } catch (error) {
            return {};
        }
    }

    public generateCommandHashes(): { [key: string]: string } {
        const slashCommands = this._slashCommands;
        const slashCommandsHash: { [key: string]: string } = {};
        for (const slashCommand of slashCommands) {
            const hash = this._hashSlashCommand(slashCommand);
            slashCommandsHash[slashCommand.data.name] = hash;
        }
        return slashCommandsHash;
    }

    private async _saveCommandHashes(hashes: { [key: string]: string }): Promise<void> {
        const dirPath = dirname(this._slashCommandsHashPath);
        try {
            await mkdir(dirPath, { recursive: true });
            this._logger.debug(`Directory '${dirPath}' is created or already exists.`);
        } catch (error) {
            this._logger.error(`Error creating directory for slash commands hashes: ${error}`);
            return;
        }

        const slashCommandsHashString = JSON.stringify(hashes);
        await writeFile(this._slashCommandsHashPath, slashCommandsHashString);
        this._logger.debug(hashes, `Saved slash command hashes to '${this._slashCommandsHashPath}'.`);
        return;
    }

    private _hashSlashCommand(slashCommand: ISlashCommand): string {
        const slashCommandData = slashCommand.data;
        const slashCommandDataString = JSON.stringify(slashCommandData);
        const hash = createHash('sha256').update(slashCommandDataString).digest('hex');
        return hash;
    }
}

import type { CommandHashes, IDeploymentDispatcher } from '@type/IDeploymentDispatcher';
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
        await this.loadSlashCommands();
        this._logger.info(`Checking slash commands for deployment: ${this.commandsToString()}`);
        await this.deploySlashCommandsIfNeeded();
    }

    private async loadSlashCommands(): Promise<void> {
        const slashCommandFiles = (await readdir(this._slashCommandsPath)).filter(file => file.endsWith('.js'));
        for (const file of slashCommandFiles) {
            const command: ISlashCommand | undefined = require(join(this._slashCommandsPath, file));
            if (command?.data?.name && command?.data?.description) {
                this._slashCommands.push(command);
            } else {
                this._logger.error(`Invalid slash command in '${file}'. Skipping...`);
            }
        }
        this._logger.debug(`Loaded ${this._slashCommands.length} slash commands from '${this._slashCommandsPath}'.`);
    }

    private async deploySlashCommandsIfNeeded(): Promise<void> {
        const newHashes = this.generateCommandHashes();
        const oldHashes = await this.loadCommandHashes();

        const commandsToDeploy = this._slashCommands.filter(cmd => newHashes[cmd.data.name] !== oldHashes[cmd.data.name]);

        if (commandsToDeploy.length === 0) {
            this._logger.info('No slash commands to deploy.');
            return;
        }

        for (const command of commandsToDeploy) {
            await this.deployCommand(command);
        }

        await this.saveCommandHashes(newHashes);
    }

    private async deployCommand(command: ISlashCommand): Promise<void> {
        const url = `${this._baseUrl}/${this._applicationId}/commands`;
        const response = await fetch(url, {
            method: 'POST',
            // biome-ignore lint/style/useNamingConvention:
            headers: { 'Content-Type': 'application/json', Authorization: `Bot ${this._token}` },
            body: JSON.stringify(command.data)
        });

        if (!response.ok) {
            this._logger.error(await response.json(), `Failed to deploy '${command.data.name}'.`);
            return;
        }

        this._logger.debug(await response.json(), `Deployed '${command.data.name}' successfully.`);
    }

    private async loadCommandHashes(): Promise<CommandHashes> {
        try {
            const data = await readFile(this._slashCommandsHashPath, { encoding: 'utf8' });
            return JSON.parse(data);
        } catch (error) {
            this._logger.debug(error, 'Error while checking existing hashes.');
            return {};
        }
    }

    private async saveCommandHashes(hashes: CommandHashes): Promise<void> {
        try {
            await mkdir(dirname(this._slashCommandsHashPath), { recursive: true });
            await writeFile(this._slashCommandsHashPath, JSON.stringify(hashes));
            this._logger.debug('Saved command hashes.');
        } catch (error) {
            this._logger.error(error, 'Failed to save command hashes.');
        }
    }

    private generateCommandHashes(): CommandHashes {
        return this._slashCommands.reduce((acc, command) => {
            acc[command.data.name] = this.hashCommand(command);
            return acc;
        }, {} as CommandHashes);
    }

    private hashCommand(data: ISlashCommand): string {
        return createHash('sha256').update(JSON.stringify(data)).digest('hex');
    }

    private commandsToString(): string {
        return this._slashCommands.map(cmd => `/${cmd.data.name}`).join(', ');
    }
}

import type { IShardClient } from '@type/IShardClient';
import { MessageResponseFlags, type IInteractionManager } from '@type/IInteractionManager';
import type { IPlayerService } from '@type/player/IPlayerService';
import type { IAutocompleteCommand } from '@type/IAutocompleteCommand';
import type { IMessageComponent } from '@type/IMessageComponent';
import type { ILoggerService } from '@type/insights/ILoggerService';
import type { ISlashCommand } from '@type/ISlashCommand';
import type { AutocompleteInteraction, CommandInteraction, ComponentInteraction, PingInteraction } from 'eris';
import fs from 'node:fs';
import { join } from 'node:path';

export class InteractionManager implements IInteractionManager {
    private _logger: ILoggerService;
    private _interactionsPath: string;
    private _slashCommands = new Map<string, ISlashCommand>();
    private _autocompleteCommands = new Map<string, IAutocompleteCommand>();
    private _components = new Map<string, IMessageComponent>();
    private _fs: typeof fs;

    constructor(logger: ILoggerService, interactionsPath: string, fileSystemModule = fs) {
        this._logger = logger.updateContext({ module: 'interactions' }, false);
        this._interactionsPath = interactionsPath;
        this._fs = fileSystemModule;
        this.loadInteractionHandlers();
        this._logger.debug(`Using path '${this._interactionsPath}' for interaction handlers.`);
    }

    public loadInteractionHandlers(): void {
        const directoryContents: string[] = this._fs
            .readdirSync(this._interactionsPath)
            .filter((file) => !file.endsWith('.js'));
        if (directoryContents.length === 0) {
            this._logger.error(`No interaction folders found in path: ${this._interactionsPath}`);
            throw new Error(`No interaction folders found in path ${this._interactionsPath}. Exiting...`); // move validation to corevalidator
        }

        for (const name of directoryContents) {
            switch (name) {
                case 'slashcommand':
                    this._logger.debug(`Loading slash command interaction handlers from '${name}' directory`);
                    this._loadSlashCommandInteractionHandlers(join(this._interactionsPath, name));
                    break;
                case 'autocomplete':
                    this._logger.debug(`Loading autocomplete interaction handlers from '${name}' directory`);
                    this._loadAutocompleteInteractionHandlers(join(this._interactionsPath, name));
                    break;
                case 'component':
                    this._logger.debug(`Loading component interaction handlers from '${name}' directory`);
                    this._loadComponentInteractionHandlers(join(this._interactionsPath, name));
                    break;
                default:
                    this._logger.debug(`Unknown interaction type folder: '${name}', ignoring...`);
                    break;
            }
        }
    }

    public async handleCommandInteraction(
        logger: ILoggerService,
        shardClient: IShardClient,
        playerService: IPlayerService,
        interaction: CommandInteraction
    ): Promise<void> {
        const interactionLogger = this._getInteractionLogger(logger, shardClient, interaction);
        interactionLogger.debug(`Received command interaction with name '${interaction.data.name}'.`);

        const slashCommand = this._slashCommands.get(interaction.data.name);
        if (!slashCommand) {
            interactionLogger.debug(`No command handler found for '${interaction.data.name}'`);
            await interaction.createMessage({
                content: 'No command handler found for this command.',
                flags: MessageResponseFlags.Ephemeral
            });
            return;
        }

        await slashCommand.run(logger, shardClient, playerService, interaction);
    }

    public async handleAutocompleteInteraction(
        logger: ILoggerService,
        shardClient: IShardClient,
        _playerService: IPlayerService,
        interaction: AutocompleteInteraction
    ): Promise<void> {
        const interactionLogger = this._getInteractionLogger(logger, shardClient, interaction);
        interactionLogger.debug(`Received autocomplete interaction with name '${interaction.data.name}'.`);

        const autocompleteCommand = this._autocompleteCommands.get(interaction.data.name);
        if (!autocompleteCommand) {
            interactionLogger.debug(`No autocomplete command handler found for '${interaction.data.name}'`);
            await interaction.result([
                {
                    name: `name: ${interaction.data.name}`,
                    value: `value: ${interaction.data.name}`
                }
            ]);
            return;
        }

        logger.debug(`Handling autocomplete interaction with name '${interaction.data.name}'.`);
        await autocompleteCommand.run(logger, shardClient, interaction);
    }

    public async handleComponentInteraction(
        logger: ILoggerService,
        shardClient: IShardClient,
        _playerService: IPlayerService,
        interaction: ComponentInteraction
    ): Promise<void> {
        const interactionLogger = this._getInteractionLogger(logger, shardClient, interaction);
        interactionLogger.debug(`Received component interaction with custom id '${interaction.data.custom_id}'.`);

        const component = this._components.get(interaction.data.custom_id);
        if (!component) {
            interactionLogger.debug(`No component handler found for '${interaction.data.custom_id}'`);
            await interaction.createMessage({
                content: 'No component handler found for this command.',
                flags: MessageResponseFlags.Ephemeral
            });
            return;
        }

        await component.run(logger, shardClient, interaction);
    }

    public async handlePingInteraction(
        logger: ILoggerService,
        _shardClient: IShardClient,
        interaction: PingInteraction
    ): Promise<void> {
        logger.debug(`Acknowledging ping interaction with ID ${interaction.id}`);
        await interaction.pong();
    }

    private _loadSlashCommandInteractionHandlers(folderPath: string): void {
        const slashCommands: Map<string, ISlashCommand> = new Map<string, ISlashCommand>();
        const interactionFiles = this._getInteractionFileNames(folderPath);
        for (const file of interactionFiles) {
            const slashCommand: ISlashCommand = require(join(folderPath, file));
            if (!slashCommand.data || !slashCommand.data.name || !slashCommand.run) {
                this._logger.error(`Slash command '${file}' does not implement ISlashCommand properly. Skipping...`);
                continue;
            }
            this._logger.debug(`Slash command '${slashCommand.data.name}' loaded.`);

            slashCommands.set(slashCommand.data.name, slashCommand);
        }

        this._slashCommands = slashCommands;
    }

    private _loadAutocompleteInteractionHandlers(folderPath: string): void {
        const autocompleteCommands: Map<string, IAutocompleteCommand> = new Map<string, IAutocompleteCommand>();
        const interactionFiles = this._getInteractionFileNames(folderPath);
        for (const file of interactionFiles) {
            const autocompleteCommand: IAutocompleteCommand = require(join(folderPath, file));
            if (!autocompleteCommand.data || !autocompleteCommand.data.name || !autocompleteCommand.run) {
                this._logger.error(
                    `Autocomplete command '${file}' does not implement IAutocompleteCommand properly. Skipping...`
                );
                continue;
            }
            this._logger.debug(`Autocomplete command '${autocompleteCommand.data.name}' loaded.`);

            autocompleteCommands.set(autocompleteCommand.data.name, autocompleteCommand);
        }

        this._autocompleteCommands = autocompleteCommands;
    }

    private _loadComponentInteractionHandlers(folderPath: string): void {
        const components: Map<string, IMessageComponent> = new Map<string, IMessageComponent>();
        const interactionFiles = this._getInteractionFileNames(folderPath);
        for (const file of interactionFiles) {
            const component: IMessageComponent = require(join(folderPath, file));
            if (!component.data || !component.data.custom_id || !component.run) {
                this._logger.error(`Component '${file}' does not implement IMessageComponent properly. Skipping...`);
                continue;
            }
            this._logger.debug(`Component '${component.data.custom_id}' loaded.`);

            components.set(component.data.custom_id, component);
        }

        this._components = components;
    }

    private _getInteractionFileNames(folderPath: string): string[] {
        return this._fs.readdirSync(folderPath).filter((file) => file.endsWith('.js'));
    }

    private _getInteractionLogger(
        logger: ILoggerService,
        shardClient: IShardClient,
        interaction: CommandInteraction | AutocompleteInteraction | ComponentInteraction
    ): ILoggerService {
        const shardId = shardClient.getShardId(interaction.guildID);
        return logger.updateContext({ module: 'events', shardId: shardId, interactionId: interaction.id }, false);
    }
}

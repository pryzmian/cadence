import type { IShardClient } from '@core/_types/IShardClient';
import { InteractionManager } from '@interactions/InteractionManager';
import type { IInteractionManager } from '@interactions/_types/IInteractionManager';
import { useLogger } from '@services/insights/LoggerService';
import type { IEventHandler } from '@type/IEventHandler';
import { ShardEvents } from '@type/IEventHandler';
import { MessageResponseFlags } from '@type/IInteractionManager';
import type { ILoggerService } from '@type/insights/ILoggerService';
import { EmbedBuilder } from '@utilities/EmbedBuilder';
import {
    Constants,
    type AutocompleteInteraction,
    type CommandInteraction,
    type ComponentInteraction,
    type Interaction,
    type PingInteraction
} from 'eris';
import { join } from 'node:path';

export class InteractionCreateEventHandler implements IEventHandler {
    public name = ShardEvents.InteractionCreate;
    public once = false;
    private _interactionHandler: IInteractionManager = new InteractionManager(
        useLogger(),
        join(__dirname, '..', '..', 'interactions')
    );

    public async run(logger: ILoggerService, shardClient: IShardClient, interaction: Interaction) {
        logger.debug(`Event '${this.name}' received: Interaction ID: ${interaction.id}`);

        try {
            switch (interaction.type) {
                case Constants.InteractionTypes.APPLICATION_COMMAND:
                    await this._interactionHandler.handleCommandInteraction(
                        logger,
                        shardClient,
                        interaction as CommandInteraction
                    );
                    break;
                case Constants.InteractionTypes.APPLICATION_COMMAND_AUTOCOMPLETE:
                    await this._interactionHandler.handleAutocompleteInteraction(
                        logger,
                        shardClient,
                        interaction as AutocompleteInteraction
                    );
                    break;
                case Constants.InteractionTypes.MESSAGE_COMPONENT:
                    await this._interactionHandler.handleComponentInteraction(
                        logger,
                        shardClient,
                        interaction as ComponentInteraction
                    );
                    break;
                case Constants.InteractionTypes.PING:
                    await this._interactionHandler.handlePingInteraction(
                        logger,
                        shardClient,
                        interaction as PingInteraction
                    );
                    break;
                default:
                    logger.debug(`Received unknown interaction with ID: ${interaction.id}`);
                    break;
            }
        } catch (error: unknown) {
            await this._handleError(logger, interaction, error as Error);
        }

        logger.debug(`Handled interaction with ID: ${interaction.id}`);
    }

    private async _handleError(logger: ILoggerService, interaction: Interaction, error: unknown) {
        logger.error(error, `Error handling interaction with ID: ${interaction.id}`);

        if (error instanceof Error) {
            switch (interaction.type) {
                case Constants.InteractionTypes.APPLICATION_COMMAND:
                    await this._respondWithErrorEmbed(logger, interaction as CommandInteraction, error as Error);
                    break;
                case Constants.InteractionTypes.APPLICATION_COMMAND_AUTOCOMPLETE:
                    await this._respondWithEmptyAutocompleteResult(logger, interaction as AutocompleteInteraction);
                    break;
                case Constants.InteractionTypes.MESSAGE_COMPONENT:
                    await this._respondWithErrorEmbed(logger, interaction as CommandInteraction, error as Error);
                    break;
                case Constants.InteractionTypes.PING:
                    logger.debug(`Ignoring error in ping interaction with ID ${interaction.id}.`);
                    break;
                default:
                    logger.debug(`Ignoring error in unknown interaction with ID ${interaction.id}.`);
                    break;
            }
        }
    }

    private async _respondWithErrorEmbed(
        logger: ILoggerService,
        interaction: CommandInteraction | ComponentInteraction,
        error: Error
    ) {
        const embed = new EmbedBuilder()
            .setAuthor(
                interaction.member?.nick ?? interaction.member?.username ?? '',
                interaction.member?.avatarURL ?? interaction.member?.defaultAvatarURL
            )
            .setColor(0xf23f43)
            .setDescription(`### <:ERROR_ICON:1129529400703074324> **Unknown error encountered**\nThis is probably not your fault. Here are some technical details about the error:\n\`\`\`${error.message}\`\`\``)
            .setFooter(`Execution ID ${logger.getExecutionId()}`)
            .build();

        try {
            await interaction.createMessage({
                embeds: [embed],
                flags: MessageResponseFlags.Ephemeral
            });
            logger.debug(`Responded with error embed through new message to interaction with ID ${interaction.id}.`);
        } catch {
            await interaction.createFollowup({
                embeds: [embed],
                flags: MessageResponseFlags.Ephemeral
            });
            logger.debug(`Responded with error embed through follow up to interaction with ID ${interaction.id}.`);
        }
    }

    private async _respondWithEmptyAutocompleteResult(logger: ILoggerService, interaction: AutocompleteInteraction) {
        if (interaction.createdAt > Date.now() - 2_500) {
            logger.debug(
                `Ignoring autocomplete interaction with ID ${interaction.id} because it was created more than 2.5 seconds ago.`
            );
            return;
        }

        try {
            await interaction.result([]);
            logger.debug(`Responded with empty autocomplete result to interaction with ID ${interaction.id}.`);
        } catch {
            // Ignore any other occuring errors
            return;
        }
    }
}

module.exports = new InteractionCreateEventHandler();

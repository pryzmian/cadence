import { ShardEvents } from '@type/IEventHandler';
import type { IEventHandler } from '@type/IEventHandler';
import type { ILoggerService } from '@services/_types/insights/ILoggerService';
import type { IShardClient } from '@core/_types/IShardClient';
import type {
    AutocompleteInteraction,
    CommandInteraction,
    ComponentInteraction,
    Interaction,
    PingInteraction
} from 'eris';
import { InteractionManager } from '@interactions/InteractionManager';
import type { IInteractionManager } from '@interactions/_types/IInteractionManager';
import { join } from 'node:path';
import { useLogger } from '@services/insights/LoggerService';

export class InteractionCreateEventHandler implements IEventHandler {
    public name = ShardEvents.InteractionCreate;
    public once = false;
    private _interactionHandler: IInteractionManager = new InteractionManager(
        useLogger(),
        join(__dirname, '..', '..', 'interactions')
    );

    public async run(logger: ILoggerService, shardClient: IShardClient, interaction: Interaction) {
        logger.debug(`Event '${this.name}' received: Interaction ID: ${interaction.id}`);

        switch (interaction.constructor.name) {
            case 'CommandInteraction':
                await this._interactionHandler.handleCommandInteraction(
                    logger,
                    shardClient,
                    interaction as CommandInteraction
                );
                break;
            case 'AutocompleteInteraction':
                await this._interactionHandler.handleAutocompleteInteraction(
                    logger,
                    shardClient,
                    interaction as AutocompleteInteraction
                );
                break;
            case 'ComponentInteraction':
                await this._interactionHandler.handleComponentInteraction(
                    logger,
                    shardClient,
                    interaction as ComponentInteraction
                );
                break;
            case 'PingInteraction':
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

        logger.debug(`Handled interaction with ID: ${interaction.id}`);
    }
}

module.exports = new InteractionCreateEventHandler();

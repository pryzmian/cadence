import type { IShardClient } from '@core/_types/IShardClient';
import type { ComponentData, IMessageComponent } from '@type/IMessageComponent';
import type { ILoggerService } from '@type/insights/ILoggerService';
import type { ComponentInteraction, ComponentInteractionSelectMenuData, Embed } from 'eris';
import Eris from 'eris';

export class SelectMenuHelpCommandUsage implements IMessageComponent {
    public data: ComponentData = {
        // biome-ignore lint/style/useNamingConvention:
        custom_id: 'SelectMenu_HelpCommand_Usage',
        // biome-ignore lint/style/useNamingConvention:
        component_type: Eris.Constants.ComponentTypes.SELECT_MENU
    }

    public async run(
        logger: ILoggerService,
        shardClient: IShardClient,
        interaction: ComponentInteraction
    ): Promise<void> {
        logger.debug(`Handling '${this.data.custom_id}' component interaction...`);
        const data: ComponentInteractionSelectMenuData = interaction.data as ComponentInteractionSelectMenuData;

        const usageEmbed: Embed | undefined = this.getCommandUsageEmbed(shardClient, data.values[0]);

        if (!usageEmbed) {
            await interaction.createMessage({
                content: `No usage details found for ${data.values[0]}`,
                flags: Eris.Constants.MessageFlags.EPHEMERAL
            });
            return;
        }

        await interaction.createMessage({
            embeds: [usageEmbed],
            flags: Eris.Constants.MessageFlags.EPHEMERAL
        });
    }

    private getCommandUsageEmbed(shardClient: IShardClient, commandName: string): Embed | undefined {
        const command = shardClient.getSlashCommandByName(commandName);
        if (!command || !command.usageEmbed) {
            return;
        }

        return command.usageEmbed;
    }
}

module.exports = new SelectMenuHelpCommandUsage();

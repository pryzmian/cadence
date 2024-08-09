import type { IShardClient } from '@core/_types/IShardClient';
import type { ILoggerService } from '@services/_types/insights/ILoggerService';
import type { ISlashCommand, SlashCommandData } from '@type/ISlashCommand';
import { ButtonBuilder } from '@utilities/ButtonBuilder';
import { EmbedBuilder } from '@utilities/EmbedBuilder';
import { resolveColor } from '@utilities/EmbedUtilities';
import type { CommandInteraction } from 'eris';

export class HelpCommand implements ISlashCommand {
    public data: SlashCommandData = {
        name: 'help',
        description: 'Show help menu'
    };

    public async run(
        logger: ILoggerService,
        _shardClient: IShardClient,
        interaction: CommandInteraction
    ): Promise<void> {
        logger.debug(`Handling '${this.data.name}' command...`);

        const embed = new EmbedBuilder()
            .setColor(resolveColor('RANDOM'))
            .setDescription(`**Help Menu**\n${(100_000_000).formatAsCompact()}`);

        const button = new ButtonBuilder()
            .setLabel("Click Me!")
            .setEmoji({ name: "👍" })

        await interaction.createMessage({
            embeds: [embed.build()],
            components: [button.wrapInActionRow()]
        });
    }
}

module.exports = new HelpCommand();

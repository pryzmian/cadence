import type { IShardClient } from '@core/_types/IShardClient';
import type { ILoggerService } from '@services/_types/insights/ILoggerService';
import type { ISlashCommand, SlashCommandData } from '@type/ISlashCommand';
import { ButtonBuilder } from '@utilities/ButtonBuilder';
import { EmbedBuilder } from '@utilities/EmbedBuilder';
import { resolveColor } from '@utilities/EmbedUtilities';
import { SelectMenubuilder, SelectMenuOptionBuilder } from '@utilities/SelectMenuBuilder';
import type { CommandInteraction, SelectMenuOptions } from 'eris';
import Eris from 'eris';

export class HelpCommand implements ISlashCommand {
    public data: SlashCommandData = {
        name: 'help',
        description: 'Show help menu'
    };

    public async run(
        logger: ILoggerService, shardClient: IShardClient, interaction: CommandInteraction
    ): Promise<void> {
        logger.debug(`Handling '${this.data.name}' command...`);

        const commands: Map<string, ISlashCommand> = this.getCommands(shardClient);
        logger.debug(`Found ${commands.size} commands: ${Array.from(commands.keys()).join(', ')}`);


        const embedCommandListString = Array.from(commands.keys()).map((commandName) => {
            const command = commands.get(commandName);
            return `- **\`/${command?.data.name}\`** - ${command?.data.description}`;
        }).join('\n');

        const embed = new EmbedBuilder()
            .setColor(resolveColor('#5865F2'))
            .setDescription(`### <:RULE_ICON:1129488897034952816> List of commands\n\n${embedCommandListString}`);

        const commandUsageSelectMenuOptions: SelectMenuOptions[] = [];

        for (const command of commands.values()) {
            if (command?.usageEmbed) {
                commandUsageSelectMenuOptions.push(
                    new SelectMenuOptionBuilder()
                        .setLabel(`/${command?.data.name}`)
                        .setValue(command?.data.name)
                        .setDescription(`Show usage details for /${command?.data.name}`)
                        .build()
                );
            }
        }

        const supportServerLinkButton = new ButtonBuilder()
            .setStyle(Eris.Constants.ButtonStyles.LINK)
            .setLabel('Support server')
            .setEmoji({
                name: 'SUPPORT_ICON',
                id: '1129488848896929882'
            })
            .setURL('https://discord.gg/t6Bm8wPpXB');

        const addBotLinkButton = new ButtonBuilder()
            .setStyle(Eris.Constants.ButtonStyles.LINK)
            .setLabel('Add bot')
            .setEmoji({
                name: 'BOT_ICON',
                id: '1129488865867071669'
            })
            .setURL('https://discord.com/oauth2/authorize?client_id=1125742835946237992&permissions=0&scope=bot%20applications.commands');

        if (commandUsageSelectMenuOptions.length > 0) {
            const selectMenu = new SelectMenubuilder()
                .setCustomId('SelectMenu_HelpCommand_Usage')
                .setPlaceholder('Select a command for extra details.')
                .setOptions(commandUsageSelectMenuOptions)

            await interaction.createMessage({
                embeds: [embed.build()],
                components: [
                    selectMenu.wrapInActionRow(),
                    {
                        type: Eris.Constants.ComponentTypes.ACTION_ROW,
                        components: [supportServerLinkButton.build(), addBotLinkButton.build()]
                    }
                ]
            });
        } else {
            await interaction.createMessage({
                embeds: [embed.build()],
                components: [{
                    type: Eris.Constants.ComponentTypes.ACTION_ROW,
                    components: [supportServerLinkButton.build(), addBotLinkButton.build()]
                }]
            });
        }
    }

    private getCommands(shardClient: IShardClient): Map<string, ISlashCommand> {
        return shardClient.getSlashCommands();
    }
}

module.exports = new HelpCommand();

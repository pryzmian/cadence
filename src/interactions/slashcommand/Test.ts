import type { IShardClient } from '@core/_types/IShardClient';
import type { ISlashCommand, SlashCommandData } from '@interactions/_types/ISlashCommand';
import type { ILoggerService } from '@services/_types/insights/ILoggerService';
import { EmbedBuilder } from '@utilities/EmbedBuilder';
import { resolveColor } from '@utilities/EmbedUtilities';
import type { CommandInteraction, Embed } from 'eris';

export class TestCommand implements ISlashCommand {
    public data: SlashCommandData = {
        name: 'test',
        description: 'This is just a test command.'
    };

    public usageEmbed: Embed = new EmbedBuilder()
        .setDescription('### <:RULE_ICON:1129488897034952816> \`/test\`\nThis command is for testing purposes.')
        .setColor(resolveColor('#5865F2'))
        .build();

    public async run(
        logger: ILoggerService,
        _shardClient: IShardClient,
        interaction: CommandInteraction
    ): Promise<void> {
        logger.debug(`Handling '${this.data.name}' command...`);

        const titleIcon = '<a:AUDIO_PLAYING_GIF:1129500776818016367>'; // <a:AUDIO_PLAYING_GIF_SUCCESS:1129545909055795270>
        const embedTitle = `### ${titleIcon} Started playing`;

        const trackDuration = '**\`3:00\`**';
        const trackTitleUrl = '[**Kanye West - Bound 2**](https://www.youtube.com/watch?v=dQw4w9WgXcQ)';

        const thumbnailUrl = 'https://images-ext-1.discordapp.net/external/nCRnH44RVaG20Th4-h-p2d8F9RoTzCgm_wQDdZesZb8/%3Fsqp%3D-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg%3D%3D%26rs%3DAOn4CLB8cFU1eIJlACNNlt8ag_gWf5nmBQ/https/i.ytimg.com/vi/BBAtAM7vtgc/hq720.jpg?format=webp&width=1080&height=606';

        const embed = new EmbedBuilder()
            .setColor(resolveColor('#5865F2')) // #1E1F22 - #23A559
            .setDescription(`${embedTitle}\n${trackDuration} ${trackTitleUrl}`)
            .setThumbnail(thumbnailUrl)

        await interaction.createMessage({
            embeds: [embed.build()]
        });
    }
}

module.exports = new TestCommand();

import type { IShardClient } from '@type/IShardClient';
import type { ISlashCommand, SlashCommandData } from '@type/ISlashCommand';
import type { ILoggerService } from '@type/insights/ILoggerService';
import type { IPlayerService } from '@type/player/IPlayerService';
import { EmbedBuilder } from '@utilities/EmbedBuilder';
import { resolveColor } from '@utilities/EmbedUtilities';
import type { Track } from 'discord-player';
import type { CommandInteraction, Embed, InteractionDataOptionWithValue } from 'eris';
import Eris from 'eris';

export class TestCommand implements ISlashCommand {
    public data: SlashCommandData = {
        name: 'test',
        description: 'This is just a test command.',
        options: [
            {
                name: 'query',
                required: true,
                description: 'The query to search for',
                type: Eris.Constants.ApplicationCommandOptionTypes.STRING
            }
        ]
    };

    public usageEmbed: Embed = new EmbedBuilder()
        .setDescription('### <:RULE_ICON:1129488897034952816> `/test`\nThis command is for testing purposes.')
        .setColor(resolveColor('#5865F2'))
        .build();

    public async run(
        logger: ILoggerService,
        _shardClient: IShardClient,
        playerService: IPlayerService,
        interaction: CommandInteraction
    ): Promise<void> {
        logger.debug(`Handling '${this.data.name}' command...`);

        const searchQuery =
            interaction.data.options &&
            ((interaction.data.options[0] as InteractionDataOptionWithValue).value as string);
        logger.debug(`Search query: '${searchQuery}'`);

        if (!searchQuery) {
            await interaction.createMessage({
                embeds: [new EmbedBuilder().setDescription('no search query provided').build()]
            });
            return;
        }

        if (searchQuery.toLowerCase() === 'skip') {
            const queue = playerService.useQueue(interaction);
            queue.node.skip();
            await interaction.createMessage({
                embeds: [new EmbedBuilder().setDescription('skipped track').build()]
            });
            return;
        }

        if (searchQuery.toLowerCase() === 'leave') {
            playerService.destroyQueue(interaction);
            await interaction.createMessage({
                embeds: [new EmbedBuilder().setDescription('destroyed queue').build()]
            });
            return;
        }

        const track: Track | undefined = await playerService.play(interaction, searchQuery);

        if (!track) {
            await interaction.createMessage({
                embeds: [new EmbedBuilder().setDescription('no track found').build()]
            });
            return;
        }

        const titleIcon = '<a:AUDIO_PLAYING_GIF:1129500776818016367>'; // <a:AUDIO_PLAYING_GIF_SUCCESS:1129545909055795270>
        const embedTitle = `### ${titleIcon} ${track?.queue?.tracks?.size ?? 0 > 1 ? 'Added to queue' : 'Started playing'}`;
        const trackDuration = `**\`${track.duration}\`**`;
        const trackTitleUrl = `[**${track.title}**](${track.url})`;
        const thumbnailUrl = `${track.thumbnail ?? track.raw.thumbnail ?? ''}`;
        const trackSourceString =
            track.source === 'youtube'
                ? '<:SOURCE_YOUTUBE:1130187076999053424> **YouTube**'
                : '<:SOURCE_SPOTIFY:1130187072192389190> **Spotify**';

        await interaction.createMessage({
            embeds: [
                new EmbedBuilder()
                    .setColor(resolveColor('#5865F2'))
                    .setDescription(`${embedTitle}\n${trackDuration} ${trackTitleUrl}\n\n-# ${trackSourceString}`)
                    .setThumbnail(thumbnailUrl)
                    .build()
            ]
        });
    }
}

module.exports = new TestCommand();

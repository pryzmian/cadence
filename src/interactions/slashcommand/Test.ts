import type { ISlashCommandHook } from '@interactions/_types/ISlashCommandHook';
import { acknowledgeInteraction } from '@interactions/hooks/AcknowledgeInteraction';
import type { IShardClient } from '@type/IShardClient';
import type { ISlashCommand, SlashCommandData } from '@type/ISlashCommand';
import type { ILoggerService } from '@type/insights/ILoggerService';
import type { IPlayerService } from '@type/player/IPlayerService';
import { EmbedBuilder } from '@utilities/EmbedBuilder';
import { resolveColor, successEmbed, warningEmbed } from '@utilities/EmbedUtilities';
import type { Track } from 'discord-player';
import type { CommandInteraction, Embed, InteractionDataOptionWithValue } from 'eris';
import Eris from 'eris';
import { checkInSameVoiceChannel } from '@interactions/hooks/CheckInSameVoiceChannel';
import { checkHasVoicePermissions } from '@interactions/hooks/CheckHasVoicePermissions';

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

    public hooks: ISlashCommandHook[] = [checkInSameVoiceChannel, checkHasVoicePermissions, acknowledgeInteraction];

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
                embeds: [warningEmbed('No search query', 'You must provide a search query.').build()]
            });
            return;
        }

        if (searchQuery.toLowerCase() === 'skip') {
            const queue = playerService.useQueue(interaction);
            queue.node.skip();
            await interaction.createMessage({
                embeds: [successEmbed('Skipped track', 'Skipped the current track.').build()]
            });
            return;
        }

        if (searchQuery.toLowerCase() === 'leave') {
            playerService.destroyQueue(interaction);
            await interaction.createMessage({
                embeds: [successEmbed('Left voice channel', 'Left the voice channel and destroyed queue.').build()]
            });
            return;
        }

        const track: Track | null = await playerService.play(interaction, searchQuery);
        if (!track) {
            await interaction.createMessage({
                embeds: [
                    warningEmbed(
                        'No results found',
                        `No tracks were found with the provided search query:\n**\`${searchQuery}\`**`
                    ).build()
                ],
                flags: Eris.Constants.MessageFlags.EPHEMERAL
            });
            return;
        }

        const titleIcon = '<a:AUDIO_PLAYING_GIF_SUCCESS:1129545909055795270>'; // <a:AUDIO_PLAYING_GIF_SUCCESS:1129545909055795270>
        const trackDuration = `**\`${track.duration}\`**`;
        const trackTitleUrl = `[**${track.title}**](${track.url})`;
        const thumbnailUrl = `${track.thumbnail ?? track.raw.thumbnail ?? ''}`;
        const trackSourceString =
            track.source === 'youtube'
                ? '<:SOURCE_YOUTUBE:1130187076999053424>'
                : '<:SOURCE_SPOTIFY:1130187072192389190>';

        const embedTitle = `### ${titleIcon} ${track?.queue?.tracks?.size ?? 0 > 1 ? 'Added to queue' : 'Started playing'} from ${trackSourceString}`;


        await interaction.createMessage({
            embeds: [
                new EmbedBuilder()
                    .setColor(resolveColor('#23A55A'))
                    .setDescription(`${embedTitle}\n${trackDuration} ${trackTitleUrl}`)
                    .setThumbnail(thumbnailUrl)
                    .build()
            ]
        });
    }
}

module.exports = new TestCommand();

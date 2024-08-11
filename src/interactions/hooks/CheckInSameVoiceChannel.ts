import type { IShardClient } from '@core/_types/IShardClient';
import { MessageResponseFlags } from '@interactions/_types/IInteractionManager';
import type { ILoggerService } from '@services/_types/insights/ILoggerService';
import type { IPlayerService } from '@services/_types/player/IPlayerService';
import type { ISlashCommandHook } from '@type/ISlashCommandHook';
import { warningEmbed } from '@utilities/EmbedUtilities';
import type { CommandInteraction } from 'eris';

export class CheckInSameVoiceChannel implements ISlashCommandHook {
    public async beforeRun(
        logger: ILoggerService,
        _shardClient: IShardClient,
        playerService: IPlayerService,
        interaction: CommandInteraction
    ) {
        const voiceChannelId = interaction.member?.voiceState?.channelID;
        if (!voiceChannelId) {
            await interaction.createMessage({
                embeds: [
                    warningEmbed(
                        'Not in a voice channel',
                        'You need to be in a voice channel to perform this action.'
                    ).build()
                ],
                flags: MessageResponseFlags.Ephemeral
            });

            logger.debug('Not in a voice channel');
            return false;
        }

        const queue = playerService.useQueue(interaction);
        if (!queue.dispatcher) {
            logger.debug('No dispatcher found');
            return true;
        }

        if (queue.dispatcher.channel.id !== voiceChannelId) {
            await interaction.createMessage({
                embeds: [
                    warningEmbed(
                        'Not in the same voice channel',
                        `You need to be in the same voice channel as me to perform this action.\n\n**Voice channel:** <#${queue.dispatcher.channel.id}>`
                    ).build()
                ],
                flags: MessageResponseFlags.Ephemeral
            });

            logger.debug('Not in the same voice channel');
            return false;
        }

        logger.debug('In the same voice channel');
        return true;
    }
}

export const checkInSameVoiceChannel = new CheckInSameVoiceChannel();

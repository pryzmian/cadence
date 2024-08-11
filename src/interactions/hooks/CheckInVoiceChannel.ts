import type { IShardClient } from '@core/_types/IShardClient';
import { MessageResponseFlags } from '@interactions/_types/IInteractionManager';
import type { ILoggerService } from '@services/_types/insights/ILoggerService';
import type { IPlayerService } from '@services/_types/player/IPlayerService';
import type { ISlashCommandHook } from '@type/ISlashCommandHook';
import { warningEmbed } from '@utilities/EmbedUtilities';
import type { CommandInteraction } from 'eris';

export class CheckInVoiceChannel implements ISlashCommandHook {
    public async beforeRun(
        logger: ILoggerService,
        _shardClient: IShardClient,
        _playerService: IPlayerService,
        interaction: CommandInteraction
    ) {
        const voiceChannel = interaction.member?.voiceState?.channelID;
        if (!voiceChannel) {
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

        logger.debug('In a voice channel');
        return true;
    }
}

export const checkInVoiceChannel = new CheckInVoiceChannel();

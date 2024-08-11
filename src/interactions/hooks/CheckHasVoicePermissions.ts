import type { IShardClient } from '@core/_types/IShardClient';
import { MessageResponseFlags } from '@interactions/_types/IInteractionManager';
import type { ILoggerService } from '@services/_types/insights/ILoggerService';
import type { IPlayerService } from '@services/_types/player/IPlayerService';
import type { ISlashCommandHook } from '@type/ISlashCommandHook';
import { warningEmbed } from '@utilities/EmbedUtilities';
import Eris, { type CommandInteraction } from 'eris';

export class CheckHasVoicePermissions implements ISlashCommandHook {
    public async beforeRun(
        logger: ILoggerService,
        shardClient: IShardClient,
        _playerService: IPlayerService,
        interaction: CommandInteraction
    ) {
        const permissionsNeeded = [
            {
                value: Eris.Constants.Permissions.voiceConnect,
                name: 'Voice Channel Connect'
            },
            {
                value: Eris.Constants.Permissions.voiceSpeak,
                name: 'Voice Channel Speak'
            }
        ];
        const voiceChannelId = interaction.member?.voiceState?.channelID;

        const guild = shardClient.getClient().guilds.get(interaction.guildID ?? '');
        const voiceChannel = guild?.channels.get(voiceChannelId ?? '');
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

        const botPermissions = voiceChannel?.permissionsOf(shardClient.getClient().user.id);
        const missingPermissions = permissionsNeeded.filter((permission) => !botPermissions?.has(permission.value));

        if (missingPermissions.length > 0) {
            await interaction.createMessage({
                embeds: [
                    warningEmbed(
                        'Missing permissions',
                        `I need the following permissions in <#${voiceChannelId}> for this action:\n${missingPermissions
                            .map((permission) => `- **\`${permission.name}\`**`)
                            .join('\n')}`
                    ).build()
                ],
                flags: MessageResponseFlags.Ephemeral
            });

            logger.debug('Missing permissions');
            return false;
        }

        logger.debug('Permissions check passed');
        return true;
    }
}

export const checkHasVoicePermissions = new CheckHasVoicePermissions();

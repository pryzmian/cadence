import type { IShardClient } from '@type/IShardClient';
import type { ISlashCommand, SlashCommandData } from '@type/ISlashCommand';
import type { ILoggerService } from '@type/insights/ILoggerService';
import type { IPlayerService } from '@type/player/IPlayerService';
import { EmbedBuilder } from '@utilities/EmbedBuilder';
import { resolveColor } from '@utilities/EmbedUtilities';
import type { CommandInteraction, Embed } from 'eris';

export class StatusCommand implements ISlashCommand {
    public data: SlashCommandData = {
        name: 'status',
        description: 'Show system status of the bot.'
    };

    public usageEmbed: Embed = new EmbedBuilder()
        .setDescription('### <:RULE_ICON:1129488897034952816> `/status`\nThis command shows the status of the bot.')
        .setColor(resolveColor('#5865F2'))
        .build();

    public async run(
        logger: ILoggerService,
        _shardClient: IShardClient,
        _playerService: IPlayerService,
        _interaction: CommandInteraction
    ): Promise<void> {
        logger.debug(`Handling '${this.data.name}' command...`);

        const nodeMemoryUsageString = this._getMemoryUsage();
        const uptimeFormatted = this._getUptime();
        const replyString = `** Uptime:** ${uptimeFormatted}\n${nodeMemoryUsageString}`;
        await _interaction.createMessage(replyString);
    }

    private _getUptime(): string {
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);

        let uptimeString = '';
        if (days > 0) {
            uptimeString += `${days} day${days === 1 ? '' : 's'}, `;
        }
        if (hours > 0) {
            uptimeString += `${hours} hour${hours === 1 ? '' : 's'}, `;
        }
        if (minutes > 0) {
            uptimeString += `${minutes} minute${minutes === 1 ? '' : 's'}, `;
        }
        if (seconds > 0) {
            uptimeString += `${seconds} second${seconds === 1 ? '' : 's'} `;
        }

        return uptimeString;
    }

    private _getNodeVersion(): string {
        return process.version;
    }

    private _getMemoryUsage(): string {
        const memoryUsage = process.memoryUsage();
        const memoryUsageString =
            `** Heap total:** ${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB\n` +
            `** Heap used:** ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB\n` +
            `** External memory:** ${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB\n` +
            `** RSS:** ${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB\n` +
            `** ArrayBuffers:** ${memoryUsage.arrayBuffers} `;
        return memoryUsageString;
    }
}

module.exports = new StatusCommand();

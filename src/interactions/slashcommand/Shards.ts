import type { IShardClient } from '@core/_types/IShardClient';
import type { ISlashCommand, SlashCommandData } from '@interactions/_types/ISlashCommand';
import type { ILoggerService } from '@services/_types/insights/ILoggerService';
import { EmbedBuilder } from '@utilities/EmbedBuilder';
import { resolveColor } from '@utilities/EmbedUtilities';
import type { CommandInteraction, Embed } from 'eris';
import { availableParallelism } from 'node:os';

export class ShardsCommand implements ISlashCommand {
    public data: SlashCommandData = {
        name: 'shards',
        description: 'Show sharding information for the bot.'
    };

    public usageEmbed: Embed = new EmbedBuilder()
        //.setDescription('### <:RULE_ICON:1129488897034952816> Command usage\n\`/shards\`\nThis command shows the shard count of the bot.')
        .setDescription('### <:RULE_ICON:1129488897034952816> \`/shards\`\nThis command shows the shard count of the bot.')
        .setColor(resolveColor('#5865F2'))
        .build();

    public async run(
        logger: ILoggerService,
        _shardClient: IShardClient,
        interaction: CommandInteraction
    ): Promise<void> {
        logger.debug(`Handling '${this.data.name}' command...`);

        const workerCount =
            (process.env.WORKER_COUNT ?? '1') === 'auto'
                ? availableParallelism()
                : Number.parseInt(process.env.WORKER_COUNT ?? '1');
        const globalShardCount = _shardClient.getGlobalShardCount();
        const workerShardCount = _shardClient.getWorkerShardCount();
        const clientShardCount = _shardClient.getShardCount();

        const replyString =
            `I have a total of ** ${globalShardCount} ** global shard${globalShardCount === 1 ? '' : 's'}.\n` +
            `In this cluster I am running on ** ${workerCount}** worker${workerCount === 1 ? '' : 's'}, that is managing a total of ** ${workerShardCount}** shard${workerShardCount === 1 ? '' : 's'}.\n` +
            `The client assigned to this guild has a shard count of ** ${clientShardCount}**.`;
        await interaction.createMessage(replyString);
    }
}

module.exports = new ShardsCommand();

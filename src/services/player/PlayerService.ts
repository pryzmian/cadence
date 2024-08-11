import type { IShardClient } from '@type/IShardClient';
import type { IPlayerService } from '@type/player/IPlayerService';
import {
    type GuildNodeCreateOptions,
    type GuildQueue,
    Player,
    type PlayerNodeInitializerOptions,
    type Track,
    useQueue,
    createErisCompat
} from 'discord-player';
import type { CommandInteraction } from 'eris';
import { YoutubeiExtractor } from 'discord-player-youtubei';

let playerServiceInstance: IPlayerService;

// const playerConfig = config.get('playerConfig');
// new PlayerService(shardClient, playerConfig);

export const usePlayerService = (shardClient: IShardClient): IPlayerService => {
    if (!playerServiceInstance) {
        playerServiceInstance = new PlayerService(shardClient);
    }

    return playerServiceInstance;
};

function registerExtractors(player: Player): void {
    (async () => {
        await player.extractors.register(YoutubeiExtractor, {
            authentication: process.env.YT_EXTRACTOR_AUTH || '',
            streamOptions: {
                highWaterMark: 2 * 1_024 * 1_024 // 2MB, default is 512 KB (512 * 1_024)
            }
        });
        await player.extractors.loadDefault((ext) => !['YouTubeExtractor'].includes(ext));
    })();
}

export class PlayerService implements IPlayerService {
    private _player: Player;

    constructor(_shardClient: IShardClient) {
        this._player = new Player(createErisCompat(_shardClient.getClient()), {
            useLegacyFFmpeg: false,
            skipFFmpeg: false
        });

        registerExtractors(this._player);
    }

    public async play(
        interaction: CommandInteraction,
        searchQuery: string,
        options?: PlayerNodeInitializerOptions<unknown>
    ): Promise<null | Track<unknown>> {
        const voiceChannel = interaction.member?.voiceState?.channelID;
        if (!voiceChannel) {
            return null;
        }

        let track: undefined | Track<unknown>;
        try {
            ({ track } = await this._player.play(voiceChannel, searchQuery, options));
        } catch (error) {
            return null;
        }

        return track;
    }

    public useQueue(interaction: CommandInteraction, options?: GuildNodeCreateOptions): GuildQueue<unknown> {
        if (!interaction.guildID) {
            throw new Error('Guild ID is required to create a queue.');
        }

        let queue = useQueue(interaction.guildID);

        if (!queue) {
            queue = this._player.nodes.create(interaction.guildID, options);
        }

        return queue;
    }

    public destroyQueue(interaction: CommandInteraction): void {
        try {
            if (!interaction.guildID) {
                throw new Error('Guild ID is required to delete a queue.');
            }
            this._player.nodes.delete(interaction.guildID);
        } catch {
            const queue = this.useQueue(interaction);
            queue.delete();
        }
    }
}

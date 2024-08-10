import type { GuildQueue, Track } from 'discord-player';
import type { CommandInteraction } from 'eris';

export interface IPlayerService {
    play(interaction: CommandInteraction, searchQuery: string): Promise<undefined | Track<unknown>>;
    useQueue(interaction: CommandInteraction): GuildQueue<unknown>;
    destroyQueue(interaction: CommandInteraction): void;
}

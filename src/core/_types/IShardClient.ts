import type { ISlashCommand } from '@type/ISlashCommand';
import type Eris from 'eris';

export interface IShardClient {
    start(): Promise<void>;
    registerEventListener(eventName: string, once: boolean, listener: () => void): void;
    removeAllListeners(): void;
    setMaxListeners(maxListeners: number): void;
    getShardId(guildId: string | undefined): number;
    getShardCount(): number;
    getWorkerShardCount(): number;
    getGlobalShardCount(): number;
    deployCommand(command: ISlashCommand): Promise<Eris.ApplicationCommand>;
    getCommands(): Promise<Eris.ApplicationCommand[]>;
    deleteCommands(): Promise<void>;
    getSlashCommands(): Map<string, ISlashCommand>;
    getSlashCommandByName(name: string): ISlashCommand | undefined;
    getClient(): Eris.Client;
}

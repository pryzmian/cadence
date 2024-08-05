import type { ClientOptions } from 'eris';

export type ShardClientConfig = {
    intents: ClientOptions['intents'];
    maxShards?: number | 'auto';
    firstShardID?: number;
    lastShardID?: number;
    shardConcurrency?: 'auto' | number;
} & ClientOptions;

export type LoggerServiceConfig = {
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    pushLogsToLoki: boolean;
    prettyConsoleFormat: boolean;
    prettyConsoleIgnoreFields: string[];
};

export type HealthCheckConfig = {
    interval: number;
};

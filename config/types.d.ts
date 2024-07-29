import type { ClientOptions } from 'eris';

type ClusterConfig = {
    globalShardCount: number | 'auto';
    shardsPerCluster: number | 'auto';
};

type ShardClientConfig = {
    maxShards: number | 'auto';
    shardConcurrency?: number | 'auto';
    firstShardID?: number | undefined;
    lastShardID?: number | undefined;
} & ClientOptions;

type LoggerServiceConfig = {
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    pushLogsToLoki: boolean;
    prettyConsoleFormat: boolean;
    prettyConsoleIgnoreFields: string[];
};

type HealthCheckConfig = {
    interval: number;
};

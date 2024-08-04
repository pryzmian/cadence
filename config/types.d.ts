export type ShardClientConfig = {} & Omit<
    ClientOptions,
    'shardConcurrency' | 'firstShardID' | 'lastShardID' | 'maxShards'
>;

export type LoggerServiceConfig = {
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    pushLogsToLoki: boolean;
    prettyConsoleFormat: boolean;
    prettyConsoleIgnoreFields: string[];
};

export type HealthCheckConfig = {
    interval: number;
};

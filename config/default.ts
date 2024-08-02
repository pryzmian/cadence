import { Constants } from 'eris';
import type { WorkerManagerConfig, HealthCheckConfig, LoggerServiceConfig, ShardClientConfig } from './types.d.ts';

export const workerManagerConfig: WorkerManagerConfig = {
    globalShardCount: 1, // default: 1, recommended: 'auto', 1 or os.availableParallelism() - Cannot be lower than workerCount
    workerCount: 1 // default: 1, recommended: 'auto', 1 or equal to globalShardCount - Cannot be lower than 1
};

export const shardClientConfig: ShardClientConfig = {
    intents: [Constants.Intents.guilds, Constants.Intents.guildVoiceStates]
};

export const loggerServiceConfig: LoggerServiceConfig = {
    logLevel: 'info',
    pushLogsToLoki: false,
    prettyConsoleFormat: true,
    prettyConsoleIgnoreFields: ['environment', 'module', 'executionId', 'shardId', 'interactionId', 'guildId']
};

export const healthCheckConfig: HealthCheckConfig = {
    interval: 300_000
};

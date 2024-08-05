import { Constants } from 'eris';
import type { HealthCheckConfig, LoggerServiceConfig, ShardClientConfig } from './types.d.ts';

export const shardClientConfig: ShardClientConfig = {
    intents: [Constants.Intents.guilds, Constants.Intents.guildVoiceStates],
    maxShards: 1,
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

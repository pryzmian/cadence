/*
import type { ShardClientConfig } from '@config/types';
import { ShardClient } from '@core/ShardClient';
import { useLogger } from '@services/insights/LoggerService';

export interface ShardWorkerOptions {
    token: string;
    firstShardId: number;
    lastShardId: number;
    maxShards: number;
}

export function startShardWorker(options: ShardWorkerOptions) {
    const logger = useLogger();

    const shardClientConfig: ShardClientConfig = {
        intents: ['guilds', 'guildMessages'],
        shardConcurrency: 'auto',
        firstShardID: options.firstShardId,
        lastShardID: options.lastShardId,
        maxShards: options.maxShards
    };
    const shardClient = new ShardClient(logger, shardClientConfig);

    shardClient.start().catch((error) => {
        logger.error(error, 'An error occurred while starting the ShardClient.');
    });
}
*/

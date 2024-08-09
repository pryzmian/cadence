import config from 'config';
import '@utilities/FormattingUtility';

import type { ShardClientConfig } from '@config/types';
import { useLogger } from '@services/insights/LoggerService';
import { parentPort, workerData } from 'node:worker_threads';
import { ShardClient } from './ShardClient';
import { join } from 'node:path';

export type ShardWorkerConfig = {
    maxShards: number | 'auto';
    shardConcurrency?: number | 'auto';
    firstShardID?: number | undefined;
    lastShardID?: number | undefined;
};

const logger = useLogger();

const obs = new PerformanceObserver((items) => {
    for (const entry of items.getEntries()) {
        if (!entry.name.includes('benchmark')) {
            logger.debug(`[Metrics] Measurement '${entry.name}' took ${entry.duration.toFixed(2)}ms`);
        }
    }
});
obs.observe({ type: 'measure' });

// Shard worker startup logic
const startShardWorker = async (): Promise<void> => {
    logger.info('Starting shard worker...');

    const interactionsPath = join(__dirname, '..', 'interactions');
    const shardWorkerConfig = workerData as ShardWorkerConfig;
    const shardClientConfig: ShardClientConfig = config.get<ShardClientConfig>('shardClientConfig');
    const shardClient = new ShardClient(logger, {
        ...shardWorkerConfig,
        ...shardClientConfig
    }, interactionsPath);
    await shardClient.start();

    logger.info('Shard worker started successfully.');

    parentPort?.on('message', (message) => {
        logger.debug(`Message received from parent process: ${message}`);
    });
};

// Start the shard worker (triggered when worker is spawned)
try {
    (async () => {
        performance.mark('startShardClient:start');

        await startShardWorker();

        performance.mark('startShardClient:end');
        performance.measure('startShardClient', 'startShardClient:start', 'startShardClient:end');
    })();
} catch (error: unknown) {
    logger.error(error, 'An error occurred while starting the shard worker. Exiting...');
    process.exit(1);
}

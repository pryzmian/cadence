/*
import cluster from 'cluster';
import { type ShardWorkerOptions, startShardWorker } from './ShardWorker';
import { useLogger } from '@services/insights/LoggerService';

const logger = useLogger();

export function startClusterManager(token: string, totalShards: number, shardsPerCluster: number) {
    if (cluster.isPrimary) {
        logger.info(`Master ${process.pid} is running`);

        const numWorkers = Math.ceil(totalShards / shardsPerCluster);
        for (let i = 0; i < numWorkers; i++) {
            cluster.fork();
        }

        cluster.on('exit', (worker, _code, _signal) => {
            logger.error(`Worker ${worker.process.pid} died`);
            cluster.fork(); // Restart the worker
        });
    } else {
        const workerId = cluster.worker?.id ?? 0 - 1;
        const firstShardId = workerId * shardsPerCluster;
        const lastShardId = Math.min(firstShardId + shardsPerCluster - 1, totalShards - 1);

        logger.info(`Worker ${process.pid} started for shards ${firstShardId} to ${lastShardId}`);

        const options: ShardWorkerOptions = {
            token,
            firstShardId,
            lastShardId,
            maxShards: totalShards
        };

        startShardWorker(options);
    }
}
*/

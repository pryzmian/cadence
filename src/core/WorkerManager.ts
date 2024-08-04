import type { ShardWorkerConfig } from '@core/ShardWorker';
import type { ILoggerService } from '@services/_types/insights/ILoggerService';
import type { IWorkerManager } from '@type/IWorkerManager';
import { availableParallelism } from 'node:os';
import { Worker } from 'node:worker_threads';

export class WorkerManager implements IWorkerManager {
    private _logger: ILoggerService;
    private _workerPath: string;
    private _globalShardCount: number;
    private _totalShardCount: number;
    private _totalWorkerCount: number;
    private _currentWorkerIndex = 0;

    constructor(logger: ILoggerService, workerPath: string) {
        this._logger = logger;
        this._workerPath = workerPath;
        const globalShardCount = process.env.GLOBAL_SHARD_COUNT || '1';
        const shardCount = process.env.SHARD_COUNT || '1';
        const workerCount = process.env.WORKER_COUNT || '1';
        this._globalShardCount =
            globalShardCount.toLowerCase() === 'auto' ? availableParallelism() : Number.parseInt(globalShardCount);
        this._totalWorkerCount =
            workerCount.toLowerCase() === 'auto' ? availableParallelism() : Number.parseInt(workerCount);
        this._totalShardCount =
            shardCount.toLowerCase() === 'auto' ? availableParallelism() : Number.parseInt(shardCount);

        // Move this to corevalidator
        if (this._totalShardCount < this._totalWorkerCount) {
            this._logger.error(
                `The total shard count (${this._totalShardCount}) is lower than the total worker count (${this._totalWorkerCount}). Please adjust the configuration accordingly.`
            );
            this._logger.error('Exiting...');
            process.exit(1);
        }

        if (this._totalWorkerCount === 0) {
            this._logger.error(
                `The total worker count (${this._totalWorkerCount}) is 0. Please adjust the configuration accordingly.`
            );
            this._logger.error('Exiting...');
            process.exit(1);
        }

        if (this._totalShardCount === 0) {
            this._logger.error(
                `The total shard count (${this._totalShardCount}) is 0. Please adjust the configuration accordingly.`
            );
            this._logger.error('Exiting...');
            process.exit(1);
        }
    }

    public async start() {
        this._logger.info('Starting workers...');
        this.startNextWorker();
    }

    private startNextWorker(): void {
        if (this._currentWorkerIndex < this._totalWorkerCount) {
            const shardWorkerConfig = this.calculateShardClientConfig(this._currentWorkerIndex);
            setTimeout(() => this.startWorkerProcess(shardWorkerConfig), 1000);
            this._currentWorkerIndex++;
        } else {
            this._logger.info('All workers started successfully.');
            this._logger.info('All global shards ready.');
        }
    }

    private calculateShardClientConfig(workerIndex: number): ShardWorkerConfig {
        const shardsPerWorker = Math.ceil(this._totalShardCount / this._totalWorkerCount);
        const firstShardId = workerIndex * shardsPerWorker;
        const lastShardId = Math.min(firstShardId + shardsPerWorker - 1, this._totalShardCount - 1);

        return {
            maxShards: this._totalShardCount,
            shardConcurrency: 'auto',
            firstShardID: firstShardId,
            lastShardID: lastShardId
        };
    }

    private startWorkerProcess(shardWorkerConfig: ShardWorkerConfig): void {
        this._logger.info(
            `Starting worker process for shards ${shardWorkerConfig.firstShardID} to ${shardWorkerConfig.lastShardID}...`
        );

        const shardWorker = new Worker(this._workerPath, {
            workerData: shardWorkerConfig,
            env: process.env
        });

        shardWorker.on('message', (message) => {
            if (message === 'shardWorkerReady') {
                this._logger.info(
                    `Worker for shards ${shardWorkerConfig.firstShardID} to ${shardWorkerConfig.lastShardID} is ready.`
                );
                this.startNextWorker();
            } else {
                this._logger.debug(`Message received from worker: ${message}`);
            }
        });

        shardWorker.on('error', (error) => {
            this._logger.error(error, 'An error occurred in the worker process.');
        });

        shardWorker.on('exit', (code, signal) => {
            this._logger.error(`Worker process exited with code ${code} and signal ${signal}.`);
            // restart the worker process
            this._currentWorkerIndex--;
            this.startNextWorker();
        });

        this._logger.info('Worker process started.');
    }
}

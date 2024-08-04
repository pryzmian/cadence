// Load environment variables from .env file
import 'dotenv/config';

import config from 'config';
import packageJson from '../package.json';

import type { HealthCheckConfig } from '@config/types';
import { CoreValidator } from '@core/CoreValidator';
import { WorkerManager } from '@core/WorkerManager';
import { StorageClientHealth } from '@services/insights/health-checks/StorageClientHealth';
import { HealthCheckService } from '@services/insights/HealthCheckService';
import { useLogger } from '@services/insights/LoggerService';
import { StorageClient } from '@services/storage/StorageClient';
import { exec } from 'node:child_process';
import { join } from 'node:path';
import { performance, PerformanceObserver } from 'node:perf_hooks';
//import { DeploymentDispatcher } from '@core/DeploymentDispatcher';

// Get logger instance
const logger = useLogger();

// Initialize core components
const coreValidator = new CoreValidator(logger, config, exec, fetch, packageJson);
const workerPath = join(__dirname, 'core', 'ShardWorker');
const workerManager = new WorkerManager(logger, workerPath);
//const interactionsPath = join(__dirname, 'interactions');
//const deploymentDispatcher = new DeploymentDispatcher(logger, shardClient, interactionsPath); // need to update for worker threads...

// Initialize services
const storageClient = new StorageClient(logger);
const healthCheckConfig = config.get<HealthCheckConfig>('healthCheckConfig');
const healthCheckService = new HealthCheckService(logger);
healthCheckService.registerHealthCheck(new StorageClientHealth(storageClient));

// TESTING - Performance Observer
// Will be integrated into the metrics service later
const obs = new PerformanceObserver((items) => {
    for (const entry of items.getEntries()) {
        if (!entry.name.includes('benchmark')) {
            logger.debug(`[Metrics] Measurement '${entry.name}' took ${entry.duration.toFixed(2)}ms`);
        }
    }
});
obs.observe({ type: 'measure' });

// Application startup logic
const startApplication = async (): Promise<void> => {
    logger.info('Starting application...');

    await coreValidator.validateEnvironmentVariables();
    await coreValidator.validateConfiguration();
    await coreValidator.checkDependencies();
    await coreValidator.checkApplicationVersion();
    //await deploymentDispatcher.refreshSlashCommands();
    await workerManager.start();
    healthCheckService.start(healthCheckConfig.interval);
    logger.info('Application started successfully.');
};

// Start the application (triggered when main process is started)
try {
    (async () => {
        performance.mark('startApplication:start');

        await startApplication();

        performance.mark('startApplication:end');
        performance.measure('startApplication', 'startApplication:start', 'startApplication:end');
    })();
} catch (error: unknown) {
    logger.error(error, 'An error occurred while starting the application. Exiting...');
    process.exit(1);
}

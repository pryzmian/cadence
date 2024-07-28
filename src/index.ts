// Load environment variables from .env file
import 'dotenv/config';
import '@utilities/FormattingUtility';

import config from 'config';
import packageJson from '../package.json';

import { CoreValidator } from '@core/CoreValidator';
import { HealthCheckService } from '@services/insights/HealthCheckService';
import { ShardClient } from '@core/ShardClient';
import { StorageClient } from '@services/storage/StorageClient';
import { StorageClientHealth } from '@services/insights/health-checks/StorageClientHealth';
import { useLogger } from '@services/insights/LoggerService';
import { exec } from 'node:child_process';
import { performance, PerformanceObserver } from 'node:perf_hooks';
import { EventManager } from '@events/EventManager';
import { join } from 'node:path';
import { DeploymentDispatcher } from '@core/DeploymentDispatcher';
import type { HealthCheckConfig, ShardClientConfig } from '@config/types';

// Get logger instance
const logger = useLogger();

// Initialize core components
const shardClientConfig = config.get<ShardClientConfig>('shardClientConfig');
const healthCheckConfig = config.get<HealthCheckConfig>('healthCheckConfig');
const coreValidator = new CoreValidator(logger, config, exec, fetch, packageJson);
const shardClient = new ShardClient(logger, shardClientConfig);
const interactionsPath = join(__dirname, 'interactions');
const deploymentDispatcher = new DeploymentDispatcher(logger, shardClient, interactionsPath);

// Initialize services
const storageClient = new StorageClient(logger);
const eventsPath = join(__dirname, 'events');
const eventManager = new EventManager(logger, shardClient, eventsPath);
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
    await shardClient.start();
    await deploymentDispatcher.refreshSlashCommands();
    eventManager.loadEventHandlers();
    healthCheckService.start(healthCheckConfig.interval);

    logger.info('Application started successfully.');
};

// Start the application
try {
    (async () => {
        performance.mark('startApplication:start');

        await startApplication();

        performance.mark('startApplication:end');
        performance.measure('startApplication', 'startApplication:start', 'startApplication:end');

        // TESTING - fetch() memory leak
        setInterval(() => {
            logger.debug('Fetching GitHub repository...');
            fetch('https://api.github.com/repos/mariusbegby/cadence');
        }, 1000);
    })();
} catch (error: unknown) {
    logger.error(error, 'An error occurred while starting the application. Exiting...');
    process.exit(1);
}

import { MockLoggerService } from '@mocks/MockLoggerService';
import { ILoggerService } from '@services/_types/insights/ILoggerService';
import { HealthCheckService } from '@services/insights/HealthCheckService';
import { HealthCheckStatus, IHealthCheck } from '@type/insights/IHealthCheck';

describe('HealthCheckService', () => {
    let mockLoggerService: ILoggerService;
    let healthCheckService: HealthCheckService;

    beforeEach(() => {
        jest.clearAllMocks();
        mockLoggerService = new MockLoggerService();
        healthCheckService = new HealthCheckService(mockLoggerService);
        jest.useFakeTimers();
        jest.spyOn(global, 'setInterval');
        jest.spyOn(global, 'clearInterval');
    });

    it('should set logger context on construction', () => {
        expect(mockLoggerService.updateContext).toHaveBeenCalledWith({ module: 'services' });
    });

    it('should log start message and set interval on start', async () => {
        healthCheckService.start(1000);
        expect(mockLoggerService.debug).toHaveBeenCalledWith('Successfully started health check service.');
        expect(setInterval).toHaveBeenLastCalledWith(expect.any(Function), 1000);
    });

    it('should clear existing timer on start', async () => {
        healthCheckService.start(1000); // First start to set the timer
        healthCheckService.start(2000); // Second start should clear the first timer and set a new one
        expect(clearInterval).toHaveBeenCalledTimes(1);
    });

    it('should log stop message and clear timer on stop', async () => {
        healthCheckService.start(1000);
        healthCheckService.stop();
        expect(mockLoggerService.debug).toHaveBeenCalledWith('Successfully stopped health check service.');
        expect(clearInterval).toHaveBeenCalledTimes(1);
    });

    it('should add health check on registerHealthCheck', () => {
        const mockHealthCheck: IHealthCheck = {
            identifier: 'MockHealthCheck',
            getStatus: jest.fn(),
            check: jest.fn()
        };

        healthCheckService.registerHealthCheck(mockHealthCheck);
        expect(healthCheckService.getHealthChecks()).toContain(mockHealthCheck);
    });

    it('should set logger context on construction', () => {
        expect(mockLoggerService.updateContext).toHaveBeenCalledWith({ module: 'services' });
    });

    it('should log start message and set interval on start', async () => {
        healthCheckService.start(1000);
        expect(mockLoggerService.debug).toHaveBeenCalledWith('Successfully started health check service.');
        expect(setInterval).toHaveBeenLastCalledWith(expect.any(Function), 1000);
    });

    it('should clear existing timer on start', async () => {
        healthCheckService.start(1000); // First start to set the timer
        healthCheckService.start(2000); // Second start should clear the first timer and set a new one
        expect(clearInterval).toHaveBeenCalledTimes(1);
    });

    it('should log stop message and clear timer on stop', async () => {
        healthCheckService.start(1000);
        healthCheckService.stop();
        expect(mockLoggerService.debug).toHaveBeenCalledWith('Successfully stopped health check service.');
        expect(clearInterval).toHaveBeenCalledTimes(1);
    });

    it('should add health check on registerHealthCheck', () => {
        const mockHealthCheck = {
            identifier: 'MockHealthCheck',
            getStatus: jest.fn(),
            check: jest.fn()
        };

        healthCheckService.registerHealthCheck(mockHealthCheck);
        expect(healthCheckService.getHealthChecks()).toContain(mockHealthCheck);
    });

    it('should run health checks and log results', async () => {
        const mockHealthCheck = {
            identifier: 'MockHealthCheck',
            getStatus: jest.fn(),
            check: jest.fn().mockResolvedValue({ status: HealthCheckStatus.Healthy })
        };

        healthCheckService.registerHealthCheck(mockHealthCheck);
        healthCheckService.start(1000);
        await jest.advanceTimersByTimeAsync(1000);

        expect(mockHealthCheck.check).toHaveBeenCalled();
        expect(mockLoggerService.debug).toHaveBeenCalledWith(`Health check '${mockHealthCheck.identifier}' passed.`);
    });

    it('should run health checks with default interval and log results', async () => {
        const mockHealthCheck = {
            identifier: 'MockHealthCheck',
            getStatus: jest.fn(),
            check: jest.fn().mockResolvedValue({ status: HealthCheckStatus.Healthy })
        };

        healthCheckService.registerHealthCheck(mockHealthCheck);
        healthCheckService.start();
        await jest.advanceTimersByTimeAsync(60_000);

        expect(mockHealthCheck.check).toHaveBeenCalled();
        expect(mockLoggerService.debug).toHaveBeenCalledWith(`Health check '${mockHealthCheck.identifier}' passed.`);
    });

    it('should handle errors during health checks', async () => {
        const mockHealthCheck = {
            identifier: 'MockHealthCheck',
            getStatus: jest.fn(),
            check: jest.fn().mockRejectedValue(new Error('Health check failed.'))
        };

        healthCheckService.registerHealthCheck(mockHealthCheck);
        healthCheckService.start(1000);
        await jest.advanceTimersByTimeAsync(1000);

        expect(mockHealthCheck.check).toHaveBeenCalled();
        expect(mockLoggerService.error).toHaveBeenCalledWith(
            new Error('Health check failed.'),
            `Health check '${mockHealthCheck.identifier}' encountered an error.`
        );
    });

    it('should handle unhealthy status during health checks', async () => {
        const mockHealthCheck = {
            identifier: 'MockHealthCheck',
            getStatus: jest.fn(),
            check: jest.fn().mockResolvedValue({ status: HealthCheckStatus.Unhealthy })
        };

        healthCheckService.registerHealthCheck(mockHealthCheck);
        healthCheckService.start(1000);
        await jest.advanceTimersByTimeAsync(1000);

        expect(mockHealthCheck.check).toHaveBeenCalled();
        expect(mockLoggerService.error).toHaveBeenCalledWith(`Health check '${mockHealthCheck.identifier}' failed.`);
    });

    it('should handle unknown status during health checks', async () => {
        const mockHealthCheck = {
            identifier: 'MockHealthCheck',
            getStatus: jest.fn(),
            check: jest.fn().mockResolvedValue({ status: HealthCheckStatus.Unknown })
        };

        healthCheckService.registerHealthCheck(mockHealthCheck);
        healthCheckService.start(1000);
        await jest.advanceTimersByTimeAsync(1000);

        expect(mockHealthCheck.check).toHaveBeenCalled();
        expect(mockLoggerService.warn).toHaveBeenCalledWith(
            `Health check '${mockHealthCheck.identifier}' status is unknown.`
        );
    });

    it('should handle unknown status value during health checks', async () => {
        const mockHealthCheck = {
            identifier: 'MockHealthCheck',
            getStatus: jest.fn(),
            check: jest.fn().mockResolvedValue({ status: 'InvalidStatus' as HealthCheckStatus })
        };

        healthCheckService.registerHealthCheck(mockHealthCheck);
        healthCheckService.start(1000);
        await jest.advanceTimersByTimeAsync(1000);

        expect(mockHealthCheck.check).toHaveBeenCalled();
        expect(mockLoggerService.error).toHaveBeenCalledWith(
            `Health check '${mockHealthCheck.identifier}' returned an unknown status.`
        );
    });
});

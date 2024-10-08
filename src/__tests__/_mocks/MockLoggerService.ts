import { ILoggerService } from '@services/_types/insights/ILoggerService';

export class MockLoggerService implements ILoggerService {
    debug = jest.fn();
    info = jest.fn();
    warn = jest.fn();
    error = jest.fn();
    getLogger = jest.fn().mockReturnValue({ child: jest.fn() });
    getExecutionId(): string {
        return 'mockExecutionId';
    }
    updateContext = jest.fn().mockReturnThis();
}

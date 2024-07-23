import type { ICoreValidator } from '@type/ICoreValidator';
import type { ILoggerService } from '@type/insights/ILoggerService';

export class CoreValidator implements ICoreValidator {
    _logger: ILoggerService;

    constructor(logger: ILoggerService) {
        this._logger = logger;
    }

    async validateConfiguration() {
        this._logger.info('Validating configuration...');
        throw new Error('Not implemented');
    }

    async checkDependencies() {
        this._logger.info('Checking dependencies...');
        throw new Error('Not implemented');
    }
}

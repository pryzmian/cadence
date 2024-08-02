import type { IShardClient } from '@core/_types/IShardClient';
import type { IAutocompleteCommand } from '@type/IAutocompleteCommand';
import type { ILoggerService } from '@type/insights/ILoggerService';
import type { AutocompleteInteraction } from 'eris';

export class PlayAutocompleteCommand implements IAutocompleteCommand {
    public data = {
        name: 'play',
        description: 'play command description'
    };
    public aliases = ['h'];

    public async run(
        logger: ILoggerService,
        _shardClient: IShardClient,
        interaction: AutocompleteInteraction
    ): Promise<void> {
        logger.debug(`Handling '${this.data.name}' autocomplete command...`);
        await interaction.result([
            {
                name: `name: ${interaction.data.name}`,
                value: `value: ${interaction.data.name}`
            }
        ]);
    }
}

module.exports = new PlayAutocompleteCommand();

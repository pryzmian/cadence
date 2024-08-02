import type { IShardClient } from '@core/_types/IShardClient';
import type { ILoggerService } from '@type/insights/ILoggerService';
import type Eris from 'eris';
import type { AutocompleteInteraction } from 'eris';

export type AutocompleteCommandData = {} & Omit<Eris.ChatInputApplicationCommand, 'application_id' | 'type' | 'id'>;

export interface IAutocompleteCommand {
    data: AutocompleteCommandData;
    run: (logger: ILoggerService, shardClient: IShardClient, interaction: AutocompleteInteraction) => Promise<void>;
}

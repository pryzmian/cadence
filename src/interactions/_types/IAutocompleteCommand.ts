import type { IShardClient } from '@type/IShardClient';
import type { ILoggerService } from '@type/insights/ILoggerService';
import type { AutocompleteInteraction } from 'eris';
import type Eris from 'eris';

export type AutocompleteCommandData = {} & Omit<Eris.ChatInputApplicationCommand, 'application_id' | 'type' | 'id'>;

export interface IAutocompleteCommand {
    data: AutocompleteCommandData;
    run: (logger: ILoggerService, shardClient: IShardClient, interaction: AutocompleteInteraction) => Promise<void>;
}

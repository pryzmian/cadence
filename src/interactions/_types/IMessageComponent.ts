import type { IShardClient } from '@type/IShardClient';
import type { ILoggerService } from '@type/insights/ILoggerService';
import type { ComponentInteraction } from 'eris';
import type Eris from 'eris';

export type ComponentData = {} & Omit<
    Eris.ComponentInteractionButtonData | Eris.ComponentInteractionSelectMenuData,
    'application_id' | 'type' | 'id'
>;

export interface IMessageComponent {
    data: ComponentData;
    run: (logger: ILoggerService, shardClient: IShardClient, interaction: ComponentInteraction) => Promise<void>;
}

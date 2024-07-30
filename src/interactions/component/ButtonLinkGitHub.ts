import type { ILoggerService } from '@services/_types/insights/ILoggerService';
import type { IShardClient } from '@core/_types/IShardClient';
import type { ComponentInteraction } from 'eris';
import type { IMessageComponent } from '@type/IMessageComponent';
import Eris from 'eris';

export class ButtonLinkGithubComponent implements IMessageComponent {
    public data = {
        // biome-ignore lint/style/useNamingConvention: <explanation>
        custom_id: 'button-link-github',
        // biome-ignore lint/style/useNamingConvention: <explanation>
        component_type: Eris.Constants.ComponentTypes.BUTTON
    };

    public async run(
        logger: ILoggerService,
        _shardClient: IShardClient,
        _interaction: ComponentInteraction
    ): Promise<void> {
        logger.debug(`Handling '${this.data.custom_id}' component...`);
        await _interaction.createMessage('https://github.com/mariusbegby/cadence');
    }
}

module.exports = new ButtonLinkGithubComponent();

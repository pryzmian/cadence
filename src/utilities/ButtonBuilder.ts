import Eris, { type Button, type ActionRow, type PartialEmoji, type ButtonStyles } from 'eris';

export class ButtonBuilder {
    private button: Button;

    constructor() {
        this.button = {
            type: Eris.Constants.ComponentTypes.BUTTON,
            // biome-ignore lint/style/useNamingConvention:
            custom_id: `Button_${Math.random().toString(36).substring(7)}`,
            style: Eris.Constants.ButtonStyles.SECONDARY
        };
    }

    setStyle(style: ButtonStyles): this {
        if (style === Eris.Constants.ButtonStyles.LINK) {
            this.setCustomId('');
        } else {
            this.setURL('');
        }
        this.button.style = style;
        return this;
    }

    setLabel(label: string): this {
        this.button.label = label;
        return this;
    }

    setEmoji(emoji: Partial<PartialEmoji>): this {
        this.button.emoji = emoji;
        return this;
    }

    setURL(url: string): this {
        if (this.button.style === Eris.Constants.ButtonStyles.LINK) {
            this.button.url = url;
        } else {
            throw new Error('URL can only be set for buttons with LINK (5) style.');
        }
        return this;
    }

    setCustomId(customId: string): this {
        if (this.button.style !== Eris.Constants.ButtonStyles.LINK) {
            this.button.custom_id = customId;
        } else {
            throw new Error('Custom ID cannot be set for buttons with LINK (5) style.');
        }
        return this;
    }

    setDisabled(disabled = true): this {
        this.button.disabled = disabled;
        return this;
    }

    wrapInActionRow(): ActionRow {
        return {
            type: Eris.Constants.ComponentTypes.ACTION_ROW,
            components: [this.button]
        };
    }

    build(): Button {
        return this.button;
    }
}

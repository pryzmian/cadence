import Eris, { type SelectMenuOptions, type SelectMenu, type PartialEmoji, type ActionRow } from "eris";

export class SelectMenubuilder {
    private selectMenu: SelectMenu;

    constructor() {
        this.selectMenu = {
            type: Eris.Constants.ComponentTypes.SELECT_MENU,
            // biome-ignore lint/style/useNamingConvention:
            custom_id: `SelectMenu_${Math.random().toString(36).substring(7)}`,
            options: [],
            placeholder: 'Select an option',
            // biome-ignore lint/style/useNamingConvention:
            min_values: 1,
            // biome-ignore lint/style/useNamingConvention:
            max_values: 1
        };
    }

    setCustomId(customId: string): this {
        this.selectMenu.custom_id = customId;
        return this;
    }

    setDisabled(disabled = true): this {
        this.selectMenu.disabled = disabled;
        return this;
    }

    setMaxValues(maxValues: number): this {
        this.selectMenu.max_values = maxValues;
        return this;
    }

    setMinValues(minValues: number): this {
        this.selectMenu.min_values = minValues;
        return this;
    }

    setOptions(options: SelectMenuOptions[]): this {
        this.selectMenu.options = options;
        return this;
    }

    setPlaceholder(placeholder: string): this {
        this.selectMenu.placeholder = placeholder;
        return this;
    }

    wrapInActionRow(): ActionRow {
        return {
            type: Eris.Constants.ComponentTypes.ACTION_ROW,
            components: [this.selectMenu]
        };
    }

    build(): SelectMenu {
        return this.selectMenu;
    }
}

export class SelectMenuOptionBuilder {
    private options: SelectMenuOptions;

    constructor() {
        this.options = {
            label: '',
            value: '',
        };
    }

    setLabel(label: string): this {
        this.options.label = label;
        return this;
    }

    setValue(value: string): this {
        this.options.value = value;
        return this;
    }

    setDescription(description: string): this {
        this.options.description = description;
        return this;
    }

    setEmoji(emoji: Partial<PartialEmoji>): this {
        this.options.emoji = emoji;
        return this;
    }

    setDefault(defaultValue = false): this {
        this.options.default = defaultValue;
        return this;
    }

    build(): SelectMenuOptions {
        return this.options;
    }
}

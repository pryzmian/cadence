import { EmbedBuilder } from '@utilities/EmbedBuilder';

export const resolveColor = (color: string): number => {
    if (color === 'RANDOM') {
        const randomColor = Math.floor(Math.random() * 16777215);
        return randomColor;
    }

    if (color === 'DEFAULT') {
        return 0;
    }

    const parsedColor = Number.parseInt(color.toUpperCase().replace('#', ''), 16);
    return parsedColor;
};

export const errorEmbed = (title: string, message: string, executionId?: string): EmbedBuilder => {
    const errorEmbedBuilder = new EmbedBuilder()
        .setColor(resolveColor('#F23F43'))
        .setDescription(`### <:ERROR_ICON:1129529400703074324> **${title}**\n\n${message}`);

    if (executionId) {
        errorEmbedBuilder.setFooter(`Execution ID: ${executionId}`);
    }

    return errorEmbedBuilder;
};

export const warningEmbed = (title: string, message: string): EmbedBuilder => {
    const errorEmbedBuilder = new EmbedBuilder()
        .setColor(resolveColor('#F0B232'))
        .setDescription(`### <:WARNING_ICON:1129489282155958322> **${title}**\n\n${message}`);

    return errorEmbedBuilder;
};

export const successEmbed = (title: string, message: string): EmbedBuilder => {
    const errorEmbedBuilder = new EmbedBuilder()
        .setColor(resolveColor('#23A55A'))
        .setDescription(`### <:SUCCESS_ICON:1129489225709010994> **${title}**\n\n${message}`);

    return errorEmbedBuilder;
};

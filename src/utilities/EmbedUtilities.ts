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

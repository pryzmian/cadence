Number.prototype.formatAsCompact = function (
    this: number,
    thresholds: { value: number; symbol: string }[] = [
        { value: 1_000, symbol: 'K' },
        { value: 1_000_000, symbol: 'M' },
        { value: 1_000_000_000, symbol: 'B' }
    ]
): string {
    // Sort thresholds from largest to smallest
    thresholds.sort((a, b) => b.value - a.value);

    const absNumber = Math.abs(this);

    // Format the number based on the thresholds
    for (const { value, symbol } of thresholds) {
        if (absNumber >= value) {
            const compactNumber = this / value;
            // Determine the number of decimal places
            const roundedCompactNumber = Math.round(compactNumber * 10) / 10;
            const isWholeNumber = Math.abs(roundedCompactNumber) % 1 === 0;
            // If the number is a whole number or very close to it, round it to an integer
            if (isWholeNumber || Math.abs(roundedCompactNumber) >= 10) {
                return `${Math.round(compactNumber)}${symbol}`;
            }

            // Otherwise, use one decimal place if it's less than 10
            return `${roundedCompactNumber}${symbol}`;
        }
    }

    // Return the original number if it doesn't meet any thresholds
    return this.toString();
};

Number.prototype.formatWithSeparator = function (this: number, separator = ' '): string {
    const integerString = Math.round(this).toString();

    // Add the separator every three digits using a regular expression
    return integerString.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
};

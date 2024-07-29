import '@utilities/FormattingUtility';

describe('Number.prototype.formatAsCompact', () => {
    test('formats numbers correctly using default thresholds', () => {
        expect((123).formatAsCompact()).toBe('123');
        expect((999).formatAsCompact()).toBe('999');
        expect((1_000).formatAsCompact()).toBe('1K');
        expect((1_234).formatAsCompact()).toBe('1.2K');
        expect((9999).formatAsCompact()).toBe('10K');
        expect((12_345).formatAsCompact()).toBe('12K');
        expect((1_000_000).formatAsCompact()).toBe('1M');
        expect((1_234_567).formatAsCompact()).toBe('1.2M');
        expect((12_345_678).formatAsCompact()).toBe('12M');
        expect((1_000_000_000).formatAsCompact()).toBe('1B');
        expect((1_234_567_890).formatAsCompact()).toBe('1.2B');
    });

    test('formats numbers correctly with custom thresholds', () => {
        expect((500).formatAsCompact([{ value: 500, symbol: 'S' }])).toBe('1S');
        expect(
            (1_000).formatAsCompact([
                { value: 500, symbol: 'S' },
                { value: 1_000, symbol: 'T' }
            ])
        ).toBe('1T');
        expect(
            (2_000).formatAsCompact([
                { value: 500, symbol: 'S' },
                { value: 1_000, symbol: 'T' }
            ])
        ).toBe('2T');
    });

    test('formats negative numbers correctly', () => {
        expect((-123).formatAsCompact()).toBe('-123');
        expect((-999).formatAsCompact()).toBe('-999');
        expect((-1_000).formatAsCompact()).toBe('-1K');
        expect((-1_234).formatAsCompact()).toBe('-1.2K');
        expect((-9999).formatAsCompact()).toBe('-10K');
        expect((-12_345).formatAsCompact()).toBe('-12K');
        expect((-1_000_000).formatAsCompact()).toBe('-1M');
        expect((-1_234_567).formatAsCompact()).toBe('-1.2M');
        expect((-12_345_678).formatAsCompact()).toBe('-12M');
        expect((-1_000_000_000).formatAsCompact()).toBe('-1B');
        expect((-1_234_567_890).formatAsCompact()).toBe('-1.2B');
    });

    test('formats zero correctly', () => {
        expect((0).formatAsCompact()).toBe('0');
    });

    test('formats very small numbers correctly', () => {
        expect((0.5).formatAsCompact()).toBe('0.5');
    });

    test('formats numbers with close thresholds', () => {
        expect(
            (999).formatAsCompact([
                { value: 999, symbol: 'X' },
                { value: 1_000, symbol: 'Y' }
            ])
        ).toBe('1X');
        expect(
            (1_000).formatAsCompact([
                { value: 999, symbol: 'X' },
                { value: 1_000, symbol: 'Y' }
            ])
        ).toBe('1Y');
    });
});

describe('Number.prototype.formatWithSeparator', () => {
    test('formats numbers with default separator', () => {
        expect((1234).formatWithSeparator()).toBe('1 234');
        expect((1234567).formatWithSeparator()).toBe('1 234 567');
        expect((1234567890).formatWithSeparator()).toBe('1 234 567 890');
    });

    test('formats numbers with custom separator', () => {
        expect((1234).formatWithSeparator(',')).toBe('1,234');
        expect((1234567).formatWithSeparator(',')).toBe('1,234,567');
        expect((1234567890).formatWithSeparator(',')).toBe('1,234,567,890');
    });

    test('formats negative numbers correctly', () => {
        expect((-1234).formatWithSeparator()).toBe('-1 234');
        expect((-1234567).formatWithSeparator()).toBe('-1 234 567');
    });

    test('formats zero correctly', () => {
        expect((0).formatWithSeparator()).toBe('0');
    });

    test('formats small numbers correctly', () => {
        expect((999).formatWithSeparator()).toBe('999');
        expect((12).formatWithSeparator()).toBe('12');
    });

    test('formats numbers with various separators', () => {
        expect((1234).formatWithSeparator('.')).toBe('1.234');
        expect((1234567).formatWithSeparator('.')).toBe('1.234.567');
        expect((1234567890).formatWithSeparator('.')).toBe('1.234.567.890');
    });

    test('formats very large numbers correctly', () => {
        expect((1_000_000_000_000).formatWithSeparator()).toBe('1 000 000 000 000');
    });

    test('handles invalid separators gracefully', () => {
        expect((1234).formatWithSeparator('')).toBe('1234');
    });
});

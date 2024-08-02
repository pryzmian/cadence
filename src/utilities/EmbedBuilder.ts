import type { Embed } from 'eris';

export class EmbedBuilder {
    private embed: Embed;

    constructor() {
        this.embed = {
            type: 'rich'
        };
    }

    // biome-ignore lint/style/useNamingConvention: External API field
    setAuthor(name: string, icon_url?: string, url?: string): this {
        this.embed.author = { name, icon_url, url };
        return this;
    }

    setColor(color: number): this {
        this.embed.color = color;
        return this;
    }

    setDescription(description: string): this {
        this.embed.description = description;
        return this;
    }

    addField(name: string, value: string, inline?: boolean): this {
        if (!this.embed.fields) {
            this.embed.fields = [];
        }
        this.embed.fields.push({ name, value, inline });
        return this;
    }

    // biome-ignore lint/style/useNamingConvention: External API field
    setFooter(text: string, icon_url?: string): this {
        this.embed.footer = { text, icon_url };
        return this;
    }

    setImage(url: string): this {
        this.embed.image = { url };
        return this;
    }

    setThumbnail(url: string): this {
        this.embed.thumbnail = { url };
        return this;
    }

    setTimestamp(timestamp: Date | string = new Date()): this {
        this.embed.timestamp = timestamp;
        return this;
    }

    setTitle(title: string): this {
        this.embed.title = title;
        return this;
    }

    setURL(url: string): this {
        this.embed.url = url;
        return this;
    }

    build(): Embed {
        return this.embed;
    }
}

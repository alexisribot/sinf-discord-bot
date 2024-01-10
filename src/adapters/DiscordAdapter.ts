import { Client, Message, TextChannel } from "discord.js";

export class DiscordAdapter {
    private bot: Client;

    constructor(bot: Client) {
        this.bot = bot;
    }

    onMessageCreate(callback: (message: Message) => void) {
        this.bot.on("messageCreate", callback);
    }

    sendToChannel(channelId: string, message: string) {
        const channel = this.bot.channels.cache.get(channelId);

        if (channel instanceof TextChannel) {
            channel.send(message);
        }
    }

    async fetchUser(userId: string) {
        return this.bot.users.fetch(userId);
    }
}

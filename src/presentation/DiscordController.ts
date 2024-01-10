import { Message } from "discord.js";
import { UserShinies } from "src/entities/UserShinies";
import { DiscordAdapter } from "../adapters/DiscordAdapter";
import { ShinyUseCase } from "../useCases/ShinyUseCase";

export class DiscordController {
    private discordAdapter: DiscordAdapter;
    private shinyUseCase: ShinyUseCase;

    constructor(discordAdapter: DiscordAdapter, shinyUseCase: ShinyUseCase) {
        this.discordAdapter = discordAdapter;
        this.shinyUseCase = shinyUseCase;

        this.discordAdapter.onMessageCreate(this.handleMessageCreate.bind(this));
    }

    async handleMessageCreate(message: Message) {
        if (message.author.bot) {
            return;
        }

        const userId = message.author.id;

        if (message.content.toLowerCase() === "!classement") {
            const shinyRanking = await this.shinyUseCase.loadUserShinies();
            const formattedShinies = await this.formatShinies(shinyRanking);
            this.discordAdapter.sendToChannel(message.channel.id, `Classement des Shinies :\n${formattedShinies}`);
        } else if (message.content.toLowerCase().startsWith("!bonjour")) {
            const shinyName = message.content.slice(8).trim();
            await this.shinyUseCase.saveUserShiny(userId, shinyName);
            this.discordAdapter.sendToChannel(message.channel.id, `${message.author.username}, vous avez obtenu un ${shinyName} shiny !`);
        } else if (message.content.toLowerCase() === "!help") {
            const helpMessage = `
Guide des commandes Pokemon GO :

**!classement** : Affiche le classement des dresseurs en fonction du nombre de shinies.
**!bonjour NomduPkm** : Ajoute un shiny à votre collection. Exemple : \`!bonjour Pikachu\`.
**!help** : Affiche ce guide des commandes.

N'oubliez pas de respecter la syntaxe et de profiter de la chasse aux shinies ! 🌟
`;
            this.discordAdapter.sendToChannel(message.channel.id, helpMessage);
        }
    }

    async getFormattedUserShiniesDetails(userId: string): Promise<string> {
        const shinyDetails = await this.shinyUseCase.loadUserShinies();
        const userShinies = shinyDetails.filter((shiny) => shiny.userid === userId);
        const formattedDetails = userShinies.map((shiny) => `${this.getUsername(userId)}: ${shiny.count} shiny (${shiny.names.join(", ")})`);
        return formattedDetails.join("\n");
    }

    async getUsername(userId: string) {
        const user = await this.discordAdapter.fetchUser(userId);
        return user ? user.username : "Utilisateur inconnu";
    }

    async formatShinies(shinies: UserShinies[]): Promise<string> {
        let place = 1;
        shinies.sort((a, b) => b.count - a.count);

        const formattedRows = shinies.map(async (row) => {
            const mention = await this.discordAdapter.fetchUser(row.userid);
            const mentionString = mention ? `<@${row.userid}>` : "Utilisateur inconnu";

            const names = typeof row.names === "string" ? row.names : row.names ? row.names.join(", ") : "";

            const shinyDetails = `${mentionString}: ${row.count} shinies (${names})`;
            return `${place++}. ${shinyDetails}`;
        });

        const formattedRowsResolved = await Promise.all(formattedRows);
        return formattedRowsResolved.join("\n");
    }
}

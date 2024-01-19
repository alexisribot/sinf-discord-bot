import { Guild, GuildMember, Message } from "discord.js";
import { UserShinies } from "src/domain/entities/UserShinies";
import { DiscordAdapter } from "../adapters/DiscordAdapter";
import { CardboardUseCase } from "../application/useCases/CardboardUseCase";
import { RouletteUseCase } from "../application/useCases/RouletteUseCase";
import { ShinyUseCase } from "../application/useCases/ShinyUseCase";

export class DiscordController {
    private discordAdapter: DiscordAdapter;
    private shinyUseCase: ShinyUseCase;
    private cardboardUseCase: CardboardUseCase;
    private rouletteUseCase: RouletteUseCase;
    private isRouletteInProgress: boolean;
    private selectedMember: GuildMember | undefined;

    constructor(discordAdapter: DiscordAdapter, shinyUseCase: ShinyUseCase, cardboardUseCase: CardboardUseCase, rouletteUseCase: RouletteUseCase) {
        this.discordAdapter = discordAdapter;
        this.shinyUseCase = shinyUseCase;
        this.rouletteUseCase = rouletteUseCase;
        this.cardboardUseCase = cardboardUseCase;
        this.isRouletteInProgress = false;

        this.discordAdapter.onMessageCreate(this.handleMessageCreate.bind(this));
    }

    async bonjourCommand(message: Message): Promise<void> {
        try {
            if (message.content.toLowerCase().startsWith("!bonjour")) {
                const shinyName = message.content.slice(8).trim();
                const pokemon = await this.shinyUseCase.saveUserShiny(message.author.id, shinyName);

                this.discordAdapter.sendToChannel(message.channel.id, `${message.author.toString()}, vous avez obtenu un ${shinyName} shiny !`, [
                    pokemon,
                ]);
            }
        } catch (error) {
            this.discordAdapter.sendToChannel(
                message.channel.id,
                "Le Pokémon que vous avez saisi n'existe pas, veuillez réessayer avec un autre nom."
            );
        }
    }

    async formatShinies(shinies: UserShinies[]): Promise<string> {
        let place = 1;
        shinies.sort((a, b) => b.count - a.count);

        const formattedRows = shinies.map(async (row) => {
            const mention = await this.discordAdapter.fetchUser(row.userid);
            const mentionString = mention ? `<@${row.userid}>` : "Utilisateur inconnu";

            const namesArray = row.names.split(",");

            const nameCounts: { [name: string]: number } = {};
            namesArray.forEach((name) => {
                const cleanedName = name
                    .trim()
                    .replace(/\/([aeiouAEIOU])/g, " d'$1")
                    .replace("/", " de ");
                nameCounts[cleanedName] = (nameCounts[cleanedName] || 0) + 1;
            });

            const uniqueNames = Object.keys(nameCounts).map((name) => {
                if (nameCounts[name] > 1) {
                    return `${name} (x${nameCounts[name]})`;
                } else {
                    return name;
                }
            });

            const shinyDetails = `${mentionString}: ${row.count} shinies (${uniqueNames.join(", ")})`;
            return `${place++}. ${shinyDetails}`;
        });

        const formattedRowsResolved = await Promise.all(formattedRows);
        return formattedRowsResolved.join("\n");
    }

    async handleMessageCreate(message: Message) {
        if (message.author.bot) {
            return;
        }

        if (message.content.toLowerCase() === "!classement") {
            const shinyRanking = await this.shinyUseCase.loadUserShinies();
            const formattedShinies = await this.formatShinies(shinyRanking);
            this.discordAdapter.sendToChannel(message.channel.id, `Classement des Shinies :\n${formattedShinies}`);
        } else if (message.content.toLowerCase().startsWith("!bonjour")) {
            await this.bonjourCommand(message);
        } else if (message.content.toLowerCase() === "!help") {
            const helpMessage = `
Guide des commandes Pokemon GO :

**!classement** : Affiche le classement des dresseurs en fonction du nombre de shinies.
**!bonjour NomduPkm** : Ajoute un shiny à votre collection. Exemple : \`!bonjour Pikachu\`, pour les formes spéciales, utilise \`!bonjour caninos/hisui\`.
**!help** : Affiche ce guide des commandes.
**!roulette** : Lance la roulette pour désigner un membre qui sera banni du serveur pendant 10 secondes.

N'oubliez pas de respecter la syntaxe et de profiter de la chasse aux shinies ! 🌟
`;
            this.discordAdapter.sendToChannel(message.channel.id, helpMessage);
        } else if (message.content.toLowerCase() === "!roulette" && !this.isRouletteInProgress) {
            this.isRouletteInProgress = true;

            if (!message.guild) {
                return;
            }

            this.selectedMember = await this.rouletteUseCase.selectRandomMember(message.guild);

            if (this.selectedMember) {
                try {
                    this.rouletteUseCase.banMember(message.guild, this.selectedMember.id, message.author.id);

                    const fridgeGifUrl = this.rouletteUseCase.getRandomFridgeGifUrl();

                    const msg = this.rouletteUseCase.getRandomMessage(this.selectedMember?.user.toString());

                    this.discordAdapter.sendToChannel(message.channel.id, msg, [fridgeGifUrl]);

                    setTimeout(() => {
                        this.rouletteUseCase.unbanMember(message.guild || ({} as Guild), this.selectedMember?.id || "");
                        this.discordAdapter.sendToChannel(message.channel.id, `${this.selectedMember?.user.toString()} est de retour parmi nous !`);
                        this.isRouletteInProgress = false;
                    }, 10000);
                } catch (error) {
                    console.log(error);
                    this.discordAdapter.sendToChannel(message.channel.id, "Erreur lors de l'exécution de la roulette");
                    this.isRouletteInProgress = false;
                }
            }
        } else if (message.content.toLowerCase() === "!roulette" && this.isRouletteInProgress) {
            this.discordAdapter.sendToChannel(
                message.channel.id,
                `La roulette a déjà roulé sur ${this.selectedMember?.user.toString()} ! Prière d'attendre qu'il soit de retour`
            );
        } else if (message.content.toLowerCase() === "!classementroulette") {
            const bannedUsersRanking = await this.rouletteUseCase.getBannedMembersRanking();
            this.discordAdapter.sendToChannel(message.channel.id, bannedUsersRanking);
        }
    }
}

import { Guild } from "discord.js";
import { IRoulette } from "../../domain/interfaces/IRoulette";
import { RouletteService } from "../../domain/services/RouletteService";

export class RouletteUseCase {
    private rouletteRepository: IRoulette;
    private rouletteService: RouletteService;

    constructor(rouletteRepository: IRoulette, rouletteService: RouletteService) {
        this.rouletteRepository = rouletteRepository;
        this.rouletteService = rouletteService;
    }

    async selectRandomMember(guild: Guild) {
        const members = await guild.members.fetch();
        const eligibleMembers = members.filter((member) => !member.user.bot);
        return eligibleMembers.random();
    }

    getRandomFridgeGifUrl() {
        const fridgesGifUrls = [
            "https://media1.tenor.com/m/_HIb0hqZPpYAAAAC/old-man.gif",
            "https://media0.giphy.com/media/1qj4TXe3QaYvRIl9xe/giphy.gif",
            "https://media1.tenor.com/m/pasbRIX-Y1kAAAAC/andteam-andteam-fuma.gif",
            "https://media1.tenor.com/m/m79Gn0BlbWIAAAAC/dogs-fridge.gif",
        ];

        return fridgesGifUrls[Math.floor(Math.random() * fridgesGifUrls.length)];
    }

    getRandomMessage(member: string) {
        const messages = [
            `La roulette a parlé ! ${member} a été désigné pour rejoindre le frigo, à bientôt !`,
            `Aller, on va faire un tour dans le frigo ${member} !`,
            `Cher ${member}, la roulette a parlé, tu vas devoir aller faire un tour dans le frigo !`,
            `Ferme ta gueule ${member}, ça va te faire du bien`,
            `Le doberman ${member} va aller faire un tour dans le frigo !`,
            `1, 2, 3... FRIGO ! ${member} !`,
            `${member} va aller faire un tour dans le frigo, ne t'en déplaise !`,
        ];

        return messages[Math.floor(Math.random() * messages.length)];
    }

    banMember(guild: Guild, selectedMemberId: string, bannedBy: string) {
        guild.channels.cache.forEach(async (channel) => {
            channel.edit({
                permissionOverwrites: [
                    {
                        id: selectedMemberId,
                        deny: ["SendMessages"],
                    },
                ],
            });
        });

        this.rouletteRepository.banUser(selectedMemberId, bannedBy, 10);
    }

    unbanMember(guild: Guild, selectedMemberId: string) {
        guild.channels.cache.forEach(async (channel) => {
            channel.edit({
                permissionOverwrites: [
                    {
                        id: selectedMemberId,
                        allow: ["SendMessages"],
                    },
                ],
            });
        });
    }

    async getBannedMembersRanking(): Promise<string> {
        const bannedUsers = await this.rouletteRepository.getBannedUsers();
        const bannedUsersDetail = await this.rouletteService.getBannedMembers(bannedUsers);
        return this.rouletteService.formatBannedUsersRanking(bannedUsersDetail);
    }
}

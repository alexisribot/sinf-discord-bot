import { BannedUserDetails, FormattedBannedUser, UserStats } from "../../application/dto/roulette.dto";

export class RouletteService {
    async getBannedMembers(bannedUsersDetails: BannedUserDetails[]): Promise<FormattedBannedUser[]> {
        const userStatsMap: Map<string, UserStats> = new Map();

        bannedUsersDetails.forEach((row) => {
            if (!userStatsMap.has(row.userid)) {
                userStatsMap.set(row.userid, { ban_count: 0, total_duration: 0, banned_by: new Map<string, number>() });
            }

            const userStats = userStatsMap.get(row.userid)!;

            userStats.ban_count += 1;
            userStats.total_duration += row.duration;

            if (userStats.banned_by.has(row.banned_by)) {
                userStats.banned_by.set(row.banned_by, userStats.banned_by.get(row.banned_by)! + 1);
            } else {
                userStats.banned_by.set(row.banned_by, 1);
            }
        });

        const formattedBannedUsers: FormattedBannedUser[] = [];

        userStatsMap.forEach((stats, userId) => {
            const mentionBannedString = `<@${userId}>`;
            const mentionBannedByList = Array.from(stats.banned_by)
                .map(([bannedByUserId, count]) => `<@${bannedByUserId}> ${count}x`)
                .join(", ");
            const formattedUser: FormattedBannedUser = {
                userId,
                mentionBannedString,
                mentionBannedByList,
                stats,
            };

            formattedBannedUsers.push(formattedUser);
        });

        formattedBannedUsers.sort((a, b) => b.stats.total_duration - a.stats.total_duration);

        return formattedBannedUsers;
    }

    async formatBannedUsersRanking(users: FormattedBannedUser[]): Promise<string> {
        let rankingString = "Classement des bannis :\n";

        users.forEach((user, index) => {
            const mentionString = `${index + 1} - ${user.mentionBannedString}`;
            const detailsString = `(banni ${user.stats.ban_count}x, détails : ${this.formatBannedByDetails(user.stats.banned_by)}, ${
                user.stats.total_duration
            } secondes au total)`;

            rankingString += `${mentionString} ${detailsString}\n`;
        });

        return rankingString;
    }

    formatBannedByDetails(bannedByMap: Map<string, number>): string {
        const detailsArray: string[] = [];
        bannedByMap.forEach((count, bannedByUserId) => {
            const mentionBannedBy = `<@${bannedByUserId}>`;
            detailsArray.push(`${mentionBannedBy} ${count}x`);
        });

        return detailsArray.join(", ");
    }
}

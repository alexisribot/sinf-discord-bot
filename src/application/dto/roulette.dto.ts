export interface BannedUserDetails {
    userid: string;
    banned_by: string;
    duration: number;
}

export interface UserStats {
    ban_count: number;
    total_duration: number;
    banned_by: Map<string, number>;
}

export interface FormattedBannedUser {
    userId: string;
    mentionBannedString: string;
    mentionBannedByList: string;
    stats: UserStats;
}

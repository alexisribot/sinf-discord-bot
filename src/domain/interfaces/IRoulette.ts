import { BannedUserDetails } from "../../application/dto/roulette.dto";

export interface IRoulette {
    banUser(userid: string, bannedBy: string, duration: number): void;
    getBannedUsers(): Promise<BannedUserDetails[]>;
}

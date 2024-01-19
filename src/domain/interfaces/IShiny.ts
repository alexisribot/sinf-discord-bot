import { UserShinies } from "../entities/UserShinies";

export interface IShiny {
    init(): void;
    getAllUserShinies(): Promise<UserShinies[]>;
    saveUserShiny(pokedexId: number, userId: string, shinyName: string): Promise<void>;
}

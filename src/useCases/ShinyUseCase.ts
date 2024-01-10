import { UserShinies } from "src/entities/UserShinies";
import { ShinyRepository } from "../repositories/ShinyRepository";

export class ShinyUseCase {
    private shinyRepository: ShinyRepository;

    constructor(shinyRepository: ShinyRepository) {
        this.shinyRepository = shinyRepository;
    }

    async loadUserShinies(): Promise<UserShinies[]> {
        return this.shinyRepository.getAllUserShinies();
    }

    async saveUserShiny(userId: string, shinyName: string): Promise<void> {
        return this.shinyRepository.saveUserShiny(userId, shinyName);
    }
}

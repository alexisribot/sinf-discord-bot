import { CardboardRepository } from "../../infrastructure/repositories/CardboardRepository";

export class CardboardUseCase {
    private cardboardRepository: CardboardRepository;

    constructor(cardboardRepository: CardboardRepository) {
        this.cardboardRepository = cardboardRepository;
    }

    async getUserCardboard(userId: string): Promise<"yellow" | "red" | undefined> {
        return this.cardboardRepository.getUserCard(userId);
    }

    async giveCard(userId: string, color: "yellow" | "red"): Promise<void> {
        return this.cardboardRepository.giveCard(userId, color);
    }

    async removeCard(userId: string): Promise<void> {
        return this.cardboardRepository.removeCard(userId);
    }
}

import { UserShinies } from "../../domain/entities/UserShinies";
import { PokemonAPI } from "../../domain/interfaces/IPokemonAPI";
import { IShiny } from "../../domain/interfaces/IShiny";
import { ShinyRepository } from "../../infrastructure/repositories/ShinyRepository";

export class ShinyUseCase {
    private shinyRepository: IShiny;
    private pokemonAPI: PokemonAPI;

    constructor(shinyRepository: ShinyRepository, pokemonAPI: PokemonAPI) {
        this.shinyRepository = shinyRepository;
        this.pokemonAPI = pokemonAPI;
    }

    async loadUserShinies(): Promise<UserShinies[]> {
        return this.shinyRepository.getAllUserShinies();
    }

    async saveUserShiny(userId: string, shinyName: string): Promise<string> {
        try {
            const pokemon = await this.pokemonAPI.getPokemon(shinyName);
            if (pokemon.status === 404) {
                throw new Error("Pokémon introuvable.");
            }
            await this.shinyRepository.saveUserShiny(pokemon.pokedexId, userId, shinyName);
            return pokemon.sprites.shiny;
        } catch (error) {
            console.log(error);
            throw new Error("Erreur lors de l'ajout du Pokémon shiny.");
        }
    }
}

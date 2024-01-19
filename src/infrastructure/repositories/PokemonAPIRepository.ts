import { Pokemon, PokemonAPI } from "../../domain/interfaces/IPokemonAPI";

export class PokemonAPIRepository implements PokemonAPI {
    private rootUrl: string;

    constructor() {
        this.rootUrl = "https://tyradex.vercel.app/api/v1/pokemon/";
    }

    async getPokemon(name: string): Promise<Pokemon.Response> {
        const response = await fetch(`${this.rootUrl}${name}`);
        return response.json();
    }
}

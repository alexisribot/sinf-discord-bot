export interface PokemonAPI {
    getPokemon(name: string): Promise<Pokemon.Response>;
}

export namespace Pokemon {
    export interface Sprites {
        shiny: string;
    }

    export interface Response {
        pokedexId: number;
        name: string;
        sprites: Sprites;
        status: number;
    }
}

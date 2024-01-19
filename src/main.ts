// index.ts
import { Client, GatewayIntentBits } from "discord.js";
import { config } from "dotenv";
import * as sqlite from "sqlite3";
import { DiscordAdapter } from "./adapters/DiscordAdapter";
import { CardboardUseCase, RouletteUseCase, ShinyUseCase } from "./application/useCases";
import { RouletteService } from "./domain/services/RouletteService";
import { CardboardRepository, ShinyRepository } from "./infrastructure/repositories";
import { PokemonAPIRepository } from "./infrastructure/repositories/PokemonAPIRepository";
import { RouletteRepository } from "./infrastructure/repositories/RouletteRepository";
import { DiscordController } from "./presentation/DiscordController";

config();
const bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const db = new sqlite.Database("Shinny.db");
const shinyRepository = new ShinyRepository(db);
const cardboardRepository = new CardboardRepository(db);
const pokemonRepository = new PokemonAPIRepository();
const rouletteRepository = new RouletteRepository(db);
const shinyUseCase = new ShinyUseCase(shinyRepository, pokemonRepository);
const rouletteService = new RouletteService();
const rouletteUseCase = new RouletteUseCase(rouletteRepository, rouletteService);
const cardboardUseCase = new CardboardUseCase(cardboardRepository);
const discordAdapter = new DiscordAdapter(bot);
new DiscordController(discordAdapter, shinyUseCase, cardboardUseCase, rouletteUseCase);

db.on("open", () => {
    shinyRepository.init();
    cardboardRepository.init();
    rouletteRepository.init();
});

bot.on("ready", async () => {
    console.log(`${bot.user?.tag} est bien en ligne!`);
});

bot.on("error", (error) => {
    console.error("Erreur du bot:", error);
});

bot.login(process.env.DISCORD_BOT_TOKEN);

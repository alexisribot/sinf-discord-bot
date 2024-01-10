// index.ts
import { Client } from "discord.js";
import { config } from "dotenv";
import * as sqlite from "sqlite3";
import { DiscordAdapter } from "./adapters/DiscordAdapter";
import { DiscordController } from "./presentation/DiscordController";
import { ShinyRepository } from "./repositories/ShinyRepository";
import { ShinyUseCase } from "./useCases/ShinyUseCase";

config();
const bot = new Client({ intents: 3276799 });

const db = new sqlite.Database("Shinny.db");
const shinyRepository = new ShinyRepository(db);
const shinyUseCase = new ShinyUseCase(shinyRepository);
const discordAdapter = new DiscordAdapter(bot);
new DiscordController(discordAdapter, shinyUseCase);

db.on("open", () => {
    shinyRepository.init();
    bot.login(process.env.DISCORD_BOT_TOKEN);
});

bot.on("ready", async () => {
    console.log(`${bot.user?.tag} est bien en ligne!`);
});

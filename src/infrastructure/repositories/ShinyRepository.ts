import * as sqlite from "sqlite3";
import { UserShinies } from "../../domain/entities/UserShinies";
import { IShiny } from "../../domain/interfaces/IShiny";

export class ShinyRepository implements IShiny {
    private db: sqlite.Database;

    constructor(db: sqlite.Database) {
        this.db = db;
    }

    init() {
        this.db.exec(`CREATE TABLE IF NOT EXISTS PokemonShinny (
            pokedex_id,
            userid TEXT,
            shiny_name TEXT,
            obtained_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (pokedex_id, userid, obtained_at)
        );`);
    }

    getAllUserShinies(): Promise<UserShinies[]> {
        return new Promise((resolve, reject) => {
            this.db.all(
                `SELECT userid, COUNT(*) as count, GROUP_CONCAT(shiny_name, ', ') as names FROM PokemonShinny GROUP BY userid ORDER BY count DESC`,
                (err, rows: UserShinies[]) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(rows);
                }
            );
        });
    }

    saveUserShiny(pokedexId: number, userId: string, shinyName: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.run(`INSERT INTO PokemonShinny (pokedex_id, userid, shiny_name) VALUES (?, ?, ?)`, [pokedexId, userId, shinyName], (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
}

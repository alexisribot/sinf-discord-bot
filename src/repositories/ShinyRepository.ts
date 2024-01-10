import * as sqlite from "sqlite3";
import { UserShinies } from "src/entities/UserShinies";

export class ShinyRepository {
    private db: sqlite.Database;

    constructor(db: sqlite.Database) {
        this.db = db;
    }

    init() {
        this.db.exec(`CREATE TABLE IF NOT EXISTS PokemonShinny (
            userid TEXT,
            shiny_name TEXT,
            PRIMARY KEY(userid, shiny_name)
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

    saveUserShiny(userId: string, shinyName: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.run(`INSERT INTO PokemonShinny (userid, shiny_name) VALUES (?, ?)`, [userId, shinyName], (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
}

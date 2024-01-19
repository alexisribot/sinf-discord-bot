import * as sqlite from "sqlite3";
import { BannedUserDetails } from "../../application/dto/roulette.dto";
export class RouletteRepository {
    private db: sqlite.Database;

    constructor(db: sqlite.Database) {
        this.db = db;
    }
    init() {
        this.db.exec(`CREATE TABLE IF NOT EXISTS Roulette (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userid TEXT,
                banned_by TEXT,
                date TEXT,
                duration INTEGER
            );`);
    }

    banUser(userid: string, bannedBy: string, duration: number) {
        const date = new Date().toISOString();
        this.db.run(`INSERT INTO Roulette (userid, banned_by, date, duration) VALUES (?, ?, ?, ?)`, [userid, bannedBy, date, duration]);
    }

    getBannedUsers(): Promise<BannedUserDetails[]> {
        return new Promise((resolve, reject) => {
            this.db.all(
                `
                SELECT userid, banned_by, duration
                FROM Roulette
            `,
                (err, rows: BannedUserDetails[]) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(rows);
                }
            );
        });
    }
}

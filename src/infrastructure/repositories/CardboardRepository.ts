import * as sqlite from "sqlite3";
import { Cardboard } from "src/domain/entities/Cardboard";
export class CardboardRepository {
    private db: sqlite.Database;

    constructor(db: sqlite.Database) {
        this.db = db;
    }
    init() {
        this.db.exec(`CREATE TABLE IF NOT EXISTS Card (
            userid TEXT,
            color TEXT,
            date TEXT,
            PRIMARY KEY(userid, color)
        );`);
    }

    giveCard(userId: string, color: "yellow" | "red"): Promise<void> {
        const currentDate = new Date().toISOString();
        return new Promise<void>((resolve, reject) => {
            this.db.run(`INSERT INTO Cardboard (userid, color, date) VALUES (?, ?, ?)`, [userId, color, currentDate], (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }

    async getUserCard(userId: string): Promise<"yellow" | "red" | undefined> {
        return new Promise<"yellow" | "red" | undefined>((resolve, reject) => {
            this.db.get(`SELECT color FROM Cardboard WHERE userid = ?`, [userId], (err, row: Cardboard) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (row) {
                    resolve(row.color);
                } else {
                    resolve(undefined);
                }
            });
        });
    }

    saveMuteTime(userId: string, muteStartTime: string) {
        return new Promise<void>((resolve, reject) => {
            this.db.run(`INSERT INTO Mutes (userid, mute_start_time) VALUES (?, ?)`, [userId, muteStartTime], (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }

    async removeCard(userId: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.db.run(`DELETE FROM Cardboard WHERE userid = ?`, [userId], (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
}

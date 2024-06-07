import { ResultSetHeader } from 'mysql2';
import db from './db';
import { Disruption } from '../types/disruption';
import { timeToMysql } from '../utils/formatters';

export async function getDisruptions(): Promise<Disruption[]> {
    const [disruptions] = await db.query<Disruption[]>(
        'SELECT * FROM `disruptions`;'
    );

    return disruptions;
}

export async function createDisruption(nsId: string, cause: string, timeStart: Date, stations: any, data: any) {
    const [disruptionResults] = await db.execute<ResultSetHeader>(
        'INSERT INTO `disruptions` (`nsId`, `cause`, `timeStart`, `stations`) VALUES (?, ?, ?, ?)',
        [nsId, cause, timeToMysql(timeStart), JSON.stringify(stations)]
    );

    const disruptionId = await disruptionResults.insertId;

    await db.execute(
        'INSERT INTO `disruption_updates` (`disruptionId`, `updateTime`, `data`) VALUES (?, ?, ?)',
        [disruptionId, new Date(), JSON.stringify(data)]
    );
}

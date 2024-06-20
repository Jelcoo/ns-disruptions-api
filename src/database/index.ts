import { ResultSetHeader } from 'mysql2';
import db from './db';
import { Disruption } from '../types/disruption';
import { timeToMysql } from '../utils/formatters';
import { DisruptionUpdate } from '../types/disruption_update';

export async function getDisruptions(): Promise<Disruption[]> {
    const [disruptions] = await db.query<Disruption[]>(
        'SELECT * FROM `disruptions`;'
    );

    return disruptions;
}

export async function createDisruption(nsId: string, cause: string, timeStart: Date, route: any, data: any) {
    const [disruptionResults] = await db.execute<ResultSetHeader>(
        'INSERT INTO `disruptions` (`nsId`, `cause`, `timeStart`, `route`) VALUES (?, ?, ?, ?)',
        [nsId, cause, timeToMysql(timeStart), JSON.stringify(route)]
    );

    const disruptionId = await disruptionResults.insertId;

    createDisruptionUpdate(disruptionId, new Date(data.registrationTime), data);
}

export async function updateDisruptionEnd(disruptionId: number, timeEnd: Date) {
    await db.execute(
        'UPDATE `disruptions` SET `timeEnd` = ? WHERE `disruptionId` = ?',
        [timeToMysql(timeEnd), disruptionId]
    );
}

export async function updateDisruptionStations(disruptionId: number, stations: string) {
    await db.execute(
        'UPDATE `disruptions` SET `stations` = ? WHERE `disruptionId` = ?',
        [stations, disruptionId]
    );
}

export async function updateDisruptionStationsGeo(disruptionId: number, geoData: any) {
    await db.execute(
        'UPDATE `disruptions` SET `stationsGeo` = ? WHERE `disruptionId` = ?',
        [JSON.stringify(geoData), disruptionId]
    );
}

export async function getDisruptionUpdatesByDisruptionId(disruptionId: number): Promise<DisruptionUpdate[]> {
    const [disruptionUpdates] = await db.query<DisruptionUpdate[]>(
        'SELECT * FROM `disruption_updates` WHERE `disruptionId` = ?',
        [disruptionId]
    );

    return disruptionUpdates;
}

export async function getDisruptionUpdate(data: any): Promise<DisruptionUpdate[]> {
    const [disruptionUpdate] = await db.execute<any>(
        'SELECT * FROM `disruption_updates` WHERE JSON_CONTAINS(`data`, ?)',
        [JSON.stringify(data)]
    );

    return disruptionUpdate;
}

export async function createDisruptionUpdate(disruptionId: number, updateTime: Date, data: any) {
    await db.execute(
        'INSERT INTO `disruption_updates` (`disruptionId`, `updateTime`, `data`) VALUES (?, ?, ?)',
        [disruptionId, timeToMysql(updateTime), JSON.stringify(data)]
    );
}

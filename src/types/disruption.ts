import { RowDataPacket } from "mysql2";

export interface Disruption extends RowDataPacket {
    disruptionId: number;
    nsId: string;
    cause: string;
    timeStart: Date;
    timeEnd: Date;
    route: any;
    stations: string;
    stationsGeo: any;
}

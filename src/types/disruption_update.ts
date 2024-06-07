import { RowDataPacket } from "mysql2";

export interface DisruptionUpdate extends RowDataPacket {
    updateId: number;
    disruptionId: number;
    updateTime: Date;
    data: any;
}

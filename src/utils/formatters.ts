export function timeToMysql(time: Date) {
    return time.toISOString().slice(0, 19).replace('T', ' ');
}

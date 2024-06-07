import 'dotenv/config'
import { getDisruptions as apiGetDisruptions } from './api/index';
import { getDisruptions as databaseGetDisruptions, createDisruption } from './database/index';
import { sendNotification as sendDiscordNotification } from './notification/discord';
import { hexToDecimal } from './utils/colors';

async function main() {
    const disruptions: any = await apiGetDisruptions();
    const existingDisruptions = await databaseGetDisruptions();
    const existingIds = existingDisruptions.map(disruption => disruption.nsId);

    disruptions.forEach((disrupt: any) => {
        if (existingIds.includes(disrupt.id)) return;

        createDisruption(disrupt.id, disrupt.timespans[0].cause.label, new Date(disrupt.timespans[0].start), disrupt.titleSections, disrupt);

        sendDiscordNotification('New Disruption', hexToDecimal("#ff0000"), disrupt.timespans[0].situation.label, [
            {
                name: 'Link',
                value: `https://www.ns.nl/reisinformatie/actuele-situatie-op-het-spoor/storing?id=${disrupt.id}`,
                inline: true
            }
        ]);
    });
}

main();

import 'dotenv/config';
import { CronJob } from 'cron';
import { getDisruptions as apiGetDisruptions } from './api/index';
import { getDisruptions as databaseGetDisruptions, createDisruption, getDisruptionUpdate, createDisruptionUpdate, getDisruptionUpdatesByDisruptionId } from './database/index';
import { sendNotification as sendDiscordNotification } from './notification/discord';
import { hexToDecimal } from './utils/colors';
import { updateEnd } from './updateEnd';
import { Disruption } from './types/disruption';

async function checkDisruptions() {
    console.log('Checking disruptions...');
    const disruptions: any = await apiGetDisruptions();
    const existingDisruptions = await databaseGetDisruptions();
    const existingIds = existingDisruptions.map(disruption => disruption.nsId);

    disruptions.forEach(async (disrupt: any) => {
        if (!existingIds.includes(disrupt.id)) {
            createDisruption(disrupt.id, disrupt.timespans[0].cause.label, new Date(disrupt.timespans[0].start), disrupt.titleSections, disrupt);

            sendDiscordNotification('New Disruption', hexToDecimal("#ff0000"), disrupt.timespans[0].situation.label, [
                {
                    name: 'ETA',
                    value: disrupt.expectedDuration.description,
                    inline: true
                },
                {
                    name: 'Link',
                    value: `https://www.ns.nl/reisinformatie/actuele-situatie-op-het-spoor/storing?id=${disrupt.id}`,
                    inline: true
                }
            ]);
        } else {
            const existingDisruption = existingDisruptions.find(disruption => disruption.nsId === disrupt.id);
            if (!existingDisruption) return;
    
            const disruptionUpdate = await getDisruptionUpdate(disrupt);
            if (disruptionUpdate.length > 0) return;
    
            createDisruptionUpdate(existingDisruption.disruptionId, new Date(disrupt.registrationTime), disrupt);
            
            if (disrupt.phase.id == '4') {
                sendDiscordNotification('Disruption Resolved', hexToDecimal("#00ff00"), disrupt.timespans[0].situation.label, [
                    {
                        name: 'ETA',
                        value: disrupt.expectedDuration.description,
                        inline: true
                    },
                    {
                        name: 'Link',
                        value: `https://www.ns.nl/reisinformatie/actuele-situatie-op-het-spoor/storing?id=${disrupt.id}`,
                        inline: true
                    }
                ]);
            }
        }
    });

    existingDisruptions.forEach(async (disruption: Disruption) => {
        if (disruption.timeEnd != null) return;

        const disruptionUpdates = await getDisruptionUpdatesByDisruptionId(disruption.disruptionId);
        if (disruptionUpdates.length <= 0) return;
        updateEnd(disruptions, disruption, disruptionUpdates);
    });
}

if (process.argv.includes('--now')) {
    checkDisruptions();
}

new CronJob(
	'0 * * * * *',
	function () {
        checkDisruptions();
	},
	null, // onComplete
	true, // start
	'Europe/Amsterdam'
);

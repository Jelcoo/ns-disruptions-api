import 'dotenv/config';
import { CronJob } from 'cron';
import { getDisruptions as apiGetDisruptions } from './api/index';
import { getDisruptions as databaseGetDisruptions, createDisruption, getDisruptionUpdate, createDisruptionUpdate, getDisruptionUpdatesByDisruptionId } from './database/index';
import { sendNotification as sendDiscordNotification } from './notification/discord';
import { hexToDecimal } from './utils/colors';
import { Disruption } from './types/disruption';
import { updateStations, updateEnd, updateStationsGeo } from './updateDisruption';

async function checkDisruptions() {
    console.log('Checking disruptions...');
    try {
        const disruptions: any = await apiGetDisruptions();
        let existingDisruptions = await databaseGetDisruptions();
        const existingIds = existingDisruptions.map(disruption => disruption.nsId);

        disruptions.forEach(async (disrupt: any) => {
            if (!existingIds.includes(disrupt.id)) {
                await createDisruption(disrupt.id, disrupt.timespans[0].cause.label, new Date(disrupt.timespans[0].start), disrupt.titleSections, disrupt);
                existingDisruptions = await databaseGetDisruptions();

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

        await existingDisruptions.forEach(async (disruption: Disruption) => {
            const disruptionUpdates = await getDisruptionUpdatesByDisruptionId(disruption.disruptionId);
            if (disruptionUpdates.length <= 0) return;
            const lastUpdate = disruptionUpdates[disruptionUpdates.length - 1]

            if (disruption.stations == null) {
                disruption.stations = await updateStations(disruption, lastUpdate);
            }
            
            if (disruption.stationsGeo == null) {
                updateStationsGeo(disruption);
            }

            if (disruption.timeEnd == null) {
                updateEnd(disruptions, disruption, lastUpdate);
            }
        });
    } catch (error) {
        console.error(error);
    }
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

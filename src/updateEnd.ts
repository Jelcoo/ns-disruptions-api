import 'dotenv/config';
import { Disruption } from './types/disruption';
import { DisruptionUpdate } from './types/disruption_update';
import { updateDisruptionEnd } from './database';

async function updateEnd(apiDisruptions: any, disruption: Disruption, updates: DisruptionUpdate[]) {
    const activeDisruptionsIds = apiDisruptions.map((disruption: any) => disruption.id);
    const lastUpdate = updates[updates.length - 1];

    if (activeDisruptionsIds.includes(disruption.nsId)) return;

    const endTime = lastUpdate.data.end;
    console.log(`Updating end time for ${disruption.nsId} (${endTime})`);

    updateDisruptionEnd(disruption.disruptionId, new Date(endTime));
}

export { updateEnd };

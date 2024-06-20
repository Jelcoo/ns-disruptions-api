import 'dotenv/config';
import { Disruption } from './types/disruption';
import { DisruptionUpdate } from './types/disruption_update';
import { updateDisruptionEnd, updateDisruptionStations, updateDisruptionStationsGeo } from './database';
import { getGeoRouteByStationCodes } from './api';

export async function updateEnd(apiDisruptions: any, disruption: Disruption, lastUpdate: DisruptionUpdate) {
    const activeDisruptionsIds = apiDisruptions.map((disruption: any) => disruption.id);

    if (activeDisruptionsIds.includes(disruption.nsId)) return;

    const endTime = lastUpdate.data.end;
    console.log(`Updating end time for ${disruption.nsId} (${endTime})`);

    updateDisruptionEnd(disruption.disruptionId, new Date(endTime));
}

export async function updateStations(disruption: Disruption, lastUpdate: DisruptionUpdate) {
    let stationString = "";
    lastUpdate.data.publicationSections.forEach(async (section: any) => {
        const stations = section.consequence.section.stations;
        stationString += stations.map((station: any) => station.stationCode).join(",") + ";";
    });

    console.log(`Updating stations for ${disruption.nsId} (${stationString})`);

    updateDisruptionStations(disruption.disruptionId, stationString);

    return stationString;
}

export async function updateStationsGeo(disruption: Disruption) {
    const geoData: any = [];
    const routes = disruption.stations.split(";").filter(n => n);

    for (const route of routes) {
        const geoRoute = await getGeoRouteByStationCodes(route);

        geoData.push(geoRoute);
    };

    console.log(`Updating geolocated stations for ${disruption.nsId} (${routes})`);
    
    await updateDisruptionStationsGeo(disruption.disruptionId, geoData);
}

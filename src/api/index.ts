import axios from 'axios';
import { readFileSync } from 'fs';

const urls = {
    'getDisruptions': 'https://gateway.apiportal.ns.nl/disruptions/v3',
};

const headers = {
    'Cache-Control': 'no-cache',
    'Ocp-Apim-Subscription-Key': process.env.NS_SUBSCRIPTION_KEY,
};

export async function getDisruptions(isActive = true, type = 'disruption') {
    if (process.argv.includes('--test')) {
        console.log('Using test data');
        if (process.argv.includes('--voorbij')) return JSON.parse(readFileSync('./testdata/test-data-voorbij.json', 'utf8'));
        return JSON.parse(readFileSync('./testdata/test-data.json', 'utf8'));
    }

    const response = await axios.get(`${urls.getDisruptions}?isActive=${isActive}&type=${type}`, {
        headers
    });
    
    return response.data;
}

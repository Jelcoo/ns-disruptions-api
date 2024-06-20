import axions from 'axios';
import { AxiosRequestConfig } from 'axios';
import { RawAxiosRequestHeaders } from 'axios';

const url = process.env.DISCORD_WEBHOOK_URL;
const data = {
    username: 'NS Bot',
    avatar_url: 'https://www.ns.nl/fe-platform-static/favicons/1745257/opengraph/ns-open-graph.png',
    content: '',
    embeds: [
        {
            title: '',
            description: '',
            color: 0,
            fields: [],
        }
    ]
};

const config: AxiosRequestConfig = {
    headers: {
        'Content-Type': 'application/json',
    } as RawAxiosRequestHeaders,
};

export async function sendNotification(title: string, color: number, description: string, fields: any) {
    data.embeds[0].title = title;
    data.embeds[0].description = description;
    data.embeds[0].color = color;
    data.embeds[0].fields = fields;

    if (!url) return;

    await axions.post(url!, data, config);
}

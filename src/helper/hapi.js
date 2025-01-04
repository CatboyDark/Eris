import { Client } from 'hypixel-api-reborn';
import config from '../../config.json' with { type: 'json' };

export default new Client(config.hypixelAPI, { cache: true });
import { Client } from 'hypixel-api-reborn';
import auth from '../../../auth.json' with { type: 'json' };

export default new Client(auth.hypixelAPI, { cache: true });

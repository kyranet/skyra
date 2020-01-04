import 'module-alias/register';
import { inspect } from 'util';
import { CLIENT_OPTIONS, TOKENS } from '@root/config';
import { SkyraClient } from '@lib/SkyraClient';
inspect.defaultOptions.depth = 1;

const client = new SkyraClient(CLIENT_OPTIONS);
client.login(TOKENS.BOT_TOKEN)
	.catch(error => { client.console.error(error); });

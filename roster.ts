import { createEventAdapter } from '@slack/events-api';
import { WebClient } from '@slack/web-api';
import { AddressInfo } from 'net';

const SLACK_SECRET = process.env['SLACK_SIGNING_SECRET']!;
const SLACK_TOKEN = process.env['SLACK_TOKEN']!;
const PORT = process.env['PORT'] ? parseInt(process.env['PORT']) : 3000;

const slackEvents = createEventAdapter(SLACK_SECRET);
const slackWeb = new WebClient(SLACK_TOKEN);

slackEvents.on('app_mention', async (event) => {
  const chan: string = event.channel;

  // Ask for info on all users in the channel.
  const members = (
    await slackWeb.conversations.members({channel: chan})
  ).members as string[];
  const ress = await Promise.all(
    members.map(user => slackWeb.users.info({user}))
  );

  // Collect their names.
  const names = [];
  for (const res of ress) {
    const user = res.user as any;
    if (!user.is_bot) {
      names.push(user.name as string);
    }
  }

  // Concoct a message.
  const msg = names.map(n => `- ${n}`).join('\n');
  slackWeb.chat.postMessage({
    channel: chan,
    text: msg,
  });
  console.log(msg);
});

slackEvents.on('error', (error) => {
  console.log(error.name);
});

// Run server.
(async () => {
  const server = await slackEvents.start(PORT);
  console.log(`Listening on ${(server.address() as AddressInfo).port}`);
})();

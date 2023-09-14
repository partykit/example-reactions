## 🎈 party-reactions

Welcome to the party, pal!

## Demo

The [demo](https://example-reactions.jevakallio.partykit.dev/) is a website that shows live reaction counters - as soon as someone reacts to your page, the counter is updated on all connected clients.

![Demo of two windows with the live reactions counters](./reactions.gif)

You can **create a new room with its own counter** by appending any room name to the URL. This means that you can easily implement separate counters for any subpage or section (for example, for any blog post or video on your website). See:
- **main room:** [https://example-reactions.jevakallio.partykit.dev/](https://example-reactions.jevakallio.partykit.dev/)
- **new room:** [https://example-reactions.jevakallio.partykit.dev/flowers](https://example-reactions.jevakallio.partykit.dev/flowers)

Every time you use a new identifier, a new room is automatically created.

**Each room is also its own API.** You can get the JSON data of the room by adding "party" between the main URL and the room name (except for the main room, which needs the name of "default"), see:
- **new room JSON:** [https://example-reactions.jevakallio.partykit.dev/party/flowers](https://example-reactions.jevakallio.partykit.dev/party/flowers)
- **main room JSON:** [https://example-reactions.jevakallio.partykit.dev/party/default](https://example-reactions.jevakallio.partykit.dev/party/default)

## Contents

In the application root directory, you'll find a PartyKit application that demonstrates live reaction counters, which includes a server and a client. Both are deployed via `partykit deploy`. The server was created to accommodate both client-side rendered apps, as well as SSR apps.

### Next.js

In the `nexjs-example` directory, there's a Next.js 13 app that demonstrates using the same API with React Server Components.

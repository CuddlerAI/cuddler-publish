# Cuddler Publish

Publish a finished video to your own Cuddler profile from Claude Code, Codex or Cursor, whatever tool made it.

**Beta, rolling out.** Publishing from AI assistants is being switched on for Cuddler accounts gradually. If your agent says publishing isn't available on your connection yet, you can still publish the same video from the Cuddler app or website. Tell us what breaks in the issues.

## What it does

Ask your agent: "Publish `./out/rain-boat.mp4` to my Cuddler". The `cuddler-publish` skill:

1. checks that your Cuddler connection can publish;
2. checks the file locally: MP4, MOV or WebM, up to 28 MiB and 60 seconds;
3. shows you the title, description and visibility it will use, and asks you to confirm that you own the rights to the video and that it follows Cuddler's content policy. **Nothing is uploaded before you say yes;**
4. uploads the file to your Cuddler account and publishes it. It is **private unless you asked for public**, and a public video is shown to others only after it passes Cuddler's checks;
5. gives you the link and where the video stands (private, under review, live or not allowed).

It works with any video: an export from your editor, a render from another AI tool, or a job from the [Cuddler Platform API](https://platform.cuddler.ai) (download the job's output first; the skill tells you how and never needs your API key).

| Skill | Ask your agent |
|---|---|
| [`cuddler-publish`](skills/cuddler-publish/SKILL.md) | "Publish ./clip.mp4 to my Cuddler, private" · "Post this video to my Cuddler as public" · "Is my Cuddler video live yet?" |

To make new videos and images on Cuddler from your agent, use the [Cuddler skills](https://github.com/CuddlerAI/skills); both connect to the same Cuddler server.

## Requirements

- A Cuddler account (adult, managing its own settings) at [cuddler.ai](https://cuddler.ai).
- Publishing from AI assistants enabled for your account. It is rolling out; the skill tells you when it isn't available yet.
- When you connect, allow Cuddler to **add files** to your account (the permission also used for reference images). Publishing doesn't spend credits.
- Optional: `ffprobe` (part of ffmpeg) for checking a video's length before uploading.

## Install

### Claude Code

```bash
claude plugin install cuddler-publish --marketplace CuddlerAI/cuddler-publish
```

The first time you publish, type `/mcp`, choose the Cuddler server and sign in.

### Codex

```bash
codex plugin marketplace add CuddlerAI/cuddler-publish
codex plugin add cuddler-publish@cuddler-publish
codex mcp login cuddler
```

In the Codex app: **Plugins → Add → Add a marketplace**, enter `CuddlerAI/cuddler-publish`, then install Cuddler Publish from the **Personal** tab. Step by step: [INSTALL.md](INSTALL.md).

### Cursor and other agents

```bash
npx skills add CuddlerAI/cuddler-publish
```

Then add the Cuddler MCP server `https://mcp.cuddler.ai/mcp` (Streamable HTTP) to your agent; https://cuddler.ai/mcp has one-click links. Step by step: [INSTALL.md](INSTALL.md). Or paste [INSTALL_FOR_AGENTS.md](INSTALL_FOR_AGENTS.md) to your agent and let it do the install.

Already using the [Cuddler skills](https://github.com/CuddlerAI/skills)? You are already connected to the same server; installing this plugin adds the publishing skill.

## Privacy and safety

- **What is uploaded:** only the one video file you confirmed, with the title and description you approved, to your own Cuddler account. Nothing else on your machine is read or sent. The file goes straight from your machine to Cuddler's private storage over a signed link that expires after about 10 minutes.
- **Embedded metadata is removed:** Cuddler keeps a copy of your video without the location, dates, comments and other metadata phones and cameras embed, and deletes the file you sent. Only that cleaned copy is ever shown. An upload you never publish is deleted after 7 days.
- **Who sees it:** you, until you choose public. A public video is checked by Cuddler (its title and description, and frames across the video) before anyone else can see it; a video that fails stays private. You can delete it any time in the Cuddler app.
- **Your rights:** you confirm before every upload that you own the rights to the video and everything in it (footage, music, voices, characters) and that it follows Cuddler's [content policy](https://cuddler.ai/terms). The skill never answers that for you.
- **AI content:** if the video was made with AI, say so in its description and wherever you share it.
- **Sign-in:** you sign in on cuddler.ai in your own browser. Your agent never sees your password, and you can disconnect it any time in Settings → Developer API tokens. The skill never asks for or handles Cuddler Platform API keys.
- The plugin adds one fixed header, `X-Cuddler-Source: plugin`, to its requests to the Cuddler MCP server, so Cuddler can count the connections that come from plugins. It says nothing about you or your machine.
- Publishing from AI assistants has a small daily limit per account.
- Found a security problem? Report it privately: [SECURITY.md](SECURITY.md).

Cuddler's [privacy policy](https://cuddler.ai/privacy) and [terms](https://cuddler.ai/terms) apply to what you publish.

## For Creator Partner Program members

Publishing with this skill is the same as publishing in the Cuddler app. Keep following your program's own posting guidelines (for example the "Made on Cuddler" mention, the #cuddler tag and disclosing the partnership where required). This skill doesn't track program posts and makes no promise about payouts.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). `node scripts/validate.mjs` checks the skill, manifests and evals on every pull request.

## License

The skill, scripts and manifests are MIT licensed ([LICENSE](LICENSE)). The Cuddler name and logo are trademarks of Cuddler and are not covered by the MIT license.

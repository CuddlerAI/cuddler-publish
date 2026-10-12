# Install

Two parts: the **skill** (instructions your agent reads) and the **Cuddler MCP server** (the tools that upload and publish). On Claude Code and Codex the plugin brings both; elsewhere you add them one by one. The server is the same one the [Cuddler skills](https://github.com/CuddlerAI/skills) use, so if you already connected those, you only add the skill.

## Claude Code

```bash
claude plugin install cuddler-publish --marketplace CuddlerAI/cuddler-publish
```

Inside Claude Code you can do the same with `/plugin marketplace add CuddlerAI/cuddler-publish` and then `/plugin install cuddler-publish@cuddler-publish`. Restart Claude Code, then type `/mcp`, choose the Cuddler server and sign in. A Cuddler page opens in your browser: sign in and allow the connection, including **adding files** (shown as adding reference images). Publishing doesn't spend credits, so spending credits isn't needed for this skill.

When Claude Code asks to allow `publish_video`, you can allow it each time: the skill has already asked you to confirm the post before it calls the tool.

The skill is then available as `/cuddler-publish:cuddler-publish`. You rarely need to type it: ask for what you want ("publish ./clip.mp4 to my Cuddler") and Claude picks it.

Update: `/plugin marketplace update cuddler-publish`. Remove: `/plugin uninstall cuddler-publish@cuddler-publish`.

## Codex app

1. Open **Plugins**, then **Add → Add a marketplace**. Enter `CuddlerAI/cuddler-publish` as the **Source**, leave **Git ref** and **Sparse paths** empty, and select **Add marketplace**. From a terminal, `codex plugin marketplace add CuddlerAI/cuddler-publish` does the same.
2. Find **Cuddler Publish** on the **Personal** tab and install it.
3. Installing opens a Cuddler sign-in page in your browser: sign in and allow the connection within five minutes. The page may say Cuddler hasn't reviewed the app; that's expected for Codex. Missed it? Settings → MCP servers → Cuddler → Authenticate.
4. Start a new chat: `@Cuddler Publish publish ./out/clip.mp4 to my Cuddler`.
5. Keep the permission mode on **Ask for approval**. Codex asks before `publish_video` runs and asks to allow network access for the upload: allow both. The skill has already asked you to confirm the post.

## Codex CLI

```bash
codex plugin marketplace add CuddlerAI/cuddler-publish
codex plugin add cuddler-publish@cuddler-publish
codex mcp login cuddler
```

The login opens the Cuddler sign-in page: finish it within five minutes. On a remote machine add `--no-browser` and open the printed link yourself. Check the connection with `/mcp`, then start a new session and ask, or call the skill directly with `$cuddler-publish`.

Update: `codex plugin marketplace upgrade`. Remove: `codex plugin remove cuddler-publish@cuddler-publish`.

## Cursor and other agents

1. Install the skill: `npx skills add CuddlerAI/cuddler-publish` (it asks which agent; `-a <agent>` picks one).
2. Add the MCP server `https://mcp.cuddler.ai/mcp` (Streamable HTTP). For Cursor, the Cuddler assistants page at https://cuddler.ai/mcp has a one-click link.
3. Sign in when your agent asks, in the browser.

## Gemini CLI

```bash
npx skills add CuddlerAI/cuddler-publish -a gemini-cli
gemini mcp add --transport http cuddler https://mcp.cuddler.ai/mcp
```

Then, inside Gemini CLI: `/mcp auth cuddler`.

## Check that it works

Ask your agent: "Can I publish to my Cuddler from here?" The skill checks the connection, tells you which Cuddler account it uses, and whether publishing is enabled for it yet (it is rolling out).

## Disconnect

Remove the plugin or the MCP server from your agent, and revoke the connection on cuddler.ai under Settings → Developer API tokens.

# Install Cuddler Publish (instructions for an AI agent)

The user pasted this file so you install the Cuddler publishing skill and connect their Cuddler account. Follow these steps in order. Ask before running any command.

1. **Work out which agent you are.**
   - Claude Code → run `claude plugin install cuddler-publish --marketplace CuddlerAI/cuddler-publish`.
   - Codex → run `codex plugin marketplace add CuddlerAI/cuddler-publish`, then `codex plugin add cuddler-publish@cuddler-publish`.
   - Any other agent → run `npx skills add CuddlerAI/cuddler-publish` and add the MCP server `https://mcp.cuddler.ai/mcp` (Streamable HTTP) with your own MCP command or settings. Don't hand-edit config files you don't understand; show the user what to add instead.
   - If the Cuddler MCP server is already connected (for example from the CuddlerAI/skills plugin), only the skill is new.
2. **Ask the user to sign in.** They do this themselves, in the browser:
   - Claude Code: restart, then `/mcp` → the Cuddler server → Authenticate.
   - Codex: `codex mcp login cuddler`, then a new session.
   - Others: the agent's own MCP sign-in.

   They should allow **adding files** (shown as adding reference images); publishing needs it. Never ask for a password, token, API key or code in the chat.
3. **Check.** In the next session, call the `whoami` tool and tell the user which Cuddler account is connected. Look for the `publish_video` tool: if it is missing, tell them publishing from AI assistants is rolling out and isn't enabled on their connection yet.
4. **Stop there.** Don't upload or publish anything until the user asks; every publish is confirmed with them first.

If something fails, tell the user what you ran and what came back, and point them to https://github.com/CuddlerAI/cuddler-publish/blob/main/INSTALL.md.

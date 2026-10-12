# Security

## Report a problem privately

Use GitHub's private vulnerability reporting: open the **Security** tab of this repository and choose **Report a vulnerability**. Please don't open a public issue for a security problem.

Useful to include: what you did, what happened, which agent and version, and whether any account or published video was affected. We reply within a few working days.

In scope: the skill, scripts and manifests in this repository, and how they use the Cuddler MCP server. Problems in the Cuddler service itself are welcome through the same channel.

## If a connection may be compromised

If you think an agent, a token or a session connected to your Cuddler account was exposed:

1. On cuddler.ai, open Settings → Developer API tokens and revoke the connection (or all of them).
2. Remove the plugin or MCP server from the agent, then reinstall and sign in again.
3. Check the videos on your Cuddler profile in the Cuddler app (you can make any of them private or delete them there), and tell us through the report above.

## What the skill promises

- It reaches Cuddler only through the Cuddler MCP tools and the signed upload link those tools return.
- It never asks for, prints or reads your credentials, including Cuddler Platform API keys; signing in happens in your browser.
- It uploads only the one file you confirmed, and publishes only after you confirmed the title, description, visibility and your rights to the video. Videos are private unless you asked for public.

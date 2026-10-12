# Contributing

Thanks for helping. This skill publishes other people's videos to their accounts, so the bar is: safe first, then useful.

## Before you open a pull request

```bash
node scripts/validate.mjs              # structure, manifests, the skill's rules, eval cases and mocks
node --test scripts/validate.test.mjs  # the validator's own tests (and check-video.sh, if ffmpeg is installed)
claude plugin validate --strict .      # the plugin manifests, as Claude Code reads them
```

Node.js 20 or newer; no other dependencies.

## The rules the skill keeps

- **Cuddler MCP tools only.** The skill names only tools of the Cuddler MCP server (`evals/mocks/cuddler/_tools.json` lists them); the validator rejects any other tool name.
- **One confirmation before anything is uploaded**, with the rights and content-policy question, and **private unless the user asked for public**. The validator checks that these Hard rules are present.
- **No prices, payouts or dates in the skill or the README.** Publishing is free; limits come from the tools at runtime. Don't promise anything about the Creator Partner Program.
- **The description says when to use the skill, not what it does step by step.** It must contain "Use when" and "NOT for", in at most 1,024 characters.
- **`SKILL.md` stays under 300 lines.** Move detail into `references/`.
- **Content red lines don't move**: adults only, no school settings, no public figures or real people without consent, no other people's characters, brands or music.

## Changing what the skill does

1. Add or update a case in `evals/` (see [evals/README.md](evals/README.md)): a `prompt.md`, its `graders/`, and mocks for any tool answer the case needs. Write mocks in the server's own format.
2. Run it with and without the plugin: `claude plugin eval . --case <name> --no-publish`. The with-plugin arm should win clearly; paste the result in the pull request.
3. Run the validator and its tests.

## When the Cuddler tools change

Regenerate `evals/mocks/cuddler/_tools.json` from the server's `tools/list` and check the mocks against the new results.

## Releasing

Bump `VERSION`, the three plugin manifests, the marketplace entry and `CHANGELOG.md` together (the validator checks they match), merge, then tag `v<version>` on `main`.

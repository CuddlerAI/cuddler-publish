# Changelog

All notable changes to the Cuddler Publish skill. The version here, `VERSION` and every plugin manifest must match (the validator checks).

## [0.1.0] — 2026-10-13

First version.

### Added

- **`cuddler-publish`**: publishes one finished video file (MP4, MOV or WebM, up to 28 MiB and 60 seconds) to the user's own Cuddler profile through the Cuddler MCP server: `start_upload` → PUT → `finish_upload` → `publish_video`, then `get_publish_status` for a video under review. One confirmation before anything is uploaded, with the exact title, description and visibility and the user's confirmation that they own the rights and the video follows Cuddler's content policy. Private unless the user asked for public. Cuddler keeps a copy without embedded metadata (location, dates, comments) and deletes the uploaded original.
- Notes on getting the file from the Cuddler Platform API and other tools, AI-content labeling, and a reminder for Creator Partner Program members to follow their program's posting guidelines.
- `scripts/check-video.sh`: a local check of the file's type, size and length before anything is asked or uploaded.
- Eval cases with mocked Cuddler tools, and a validator for the skill, manifests and mocks.

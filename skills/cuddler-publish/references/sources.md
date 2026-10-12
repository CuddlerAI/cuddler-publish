# Getting the file, and making it fit

Cuddler accepts one finished video per publish: **MP4, MOV or WebM, up to 28 MiB and 60 seconds**. These limits come from Cuddler; if `start_upload` or `finish_upload` reports different ones, theirs win (Hard rule 9).

## From the Cuddler Platform API (platform.cuddler.ai)

A Platform API video job is a company/developer product, separate from the user's personal Cuddler account. Its output is not on their Cuddler profile until they publish it.

- A finished job carries `output.url`: a **signed link that expires** (`output.url_expires_at`). Reading the job again returns a fresh link. The file itself is kept for 7 days (`output.retained_until`).
- Use the user's own code or the download button in the platform.cuddler.ai console to save it, for example into `./out/<job id>.mp4`. If their project already printed an `output.url`, you may download that link with a plain GET when they ask.
- Never ask for, print or pass on the Platform API key. This skill doesn't need it: publishing uses the personal Cuddler connection (the `cuddler` MCP server), not the Platform API.
- `output.duration`, `output.width` and `output.height` tell you the length and frame before you download.

## From other AI video tools or an editor

- Export or download the final render as an H.264 MP4 if the tool offers a choice; it is the most widely playable.
- Keep the generating tool's watermark or AI label if it added one.
- Check that the user has the rights to everything in it (music especially): many tools' stock music is licensed only for that tool's own platform.

## Making a copy that fits

Only with the user's OK, and always as a new file next to the original:

- **Shorter** (first 60 seconds): `ffmpeg -i in.mp4 -t 60 -c copy out/in-60s.mp4` (a stream copy cuts at a keyframe; re-encode if the cut must be exact).
- **Smaller** (720p, about 2.5 Mbps): `ffmpeg -i in.mp4 -vf "scale=-2:'min(720,ih)'" -c:v libx264 -preset veryfast -b:v 2500k -maxrate 3000k -bufsize 6000k -c:a aac -b:a 128k -movflags +faststart out/in-720p.mp4`.
- **Standard MP4** from WebM or MOV: the same command as "Smaller".

Re-check the new file (Step 3) and confirm the post again with the new file before uploading it.

## What Cuddler does with the file

- The PUT goes to Cuddler's private storage. `finish_upload` checks that the file plays and is within the limits, keeps a copy without location, dates, comments and other embedded metadata, and deletes the original. Nothing is published yet; an upload never published is deleted after 7 days.
- `publish_video` runs the same steps as an upload in the Cuddler app: the title and description are checked against the content policy, the video is prepared for playback, and frames across the video are checked before anyone else can see it (a private video is checked too, so a later publish in the app starts from that result).
- A video that fails a check stays private. The user can see it, and delete it, in the Cuddler app.

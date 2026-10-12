#!/usr/bin/env bash
# Local pre-check for cuddler-publish: prints the file's content type, size and
# length against Cuddler's publishing limits. Reads the file only; uploads
# nothing and changes nothing. Needs ffprobe for the length (optional).
#
# Usage: check-video.sh <file>
# Exit:  0 within the limits (or length unknown), 1 over a limit, 2 bad input.
set -euo pipefail

MAX_BYTES=$((28 * 1024 * 1024))
MAX_SECONDS=60

file="${1:-}"
if [[ -z "$file" || ! -f "$file" ]]; then
  echo "usage: check-video.sh <video file>" >&2
  exit 2
fi

# Lower-case the name portably (macOS still ships bash 3.2, which lacks ${var,,}).
lower=$(printf '%s' "$file" | tr '[:upper:]' '[:lower:]')
case "$lower" in
  *.mp4) type="video/mp4" ;;
  *.mov) type="video/quicktime" ;;
  *.webm) type="video/webm" ;;
  *)
    echo "type: unsupported (use an .mp4, .mov or .webm file)"
    exit 1
    ;;
esac

if stat -f%z "$file" >/dev/null 2>&1; then
  bytes=$(stat -f%z "$file")
else
  bytes=$(stat -c%s "$file")
fi

status=0
echo "type: $type"
echo "bytes: $bytes (limit $MAX_BYTES)"
if (( bytes > MAX_BYTES )); then
  echo "size: OVER the limit"
  status=1
fi

if command -v ffprobe >/dev/null 2>&1; then
  seconds=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$file" 2>/dev/null || true)
  if [[ -z "$seconds" || "$seconds" == "N/A" ]]; then
    echo "seconds: unreadable (Cuddler will refuse a file that does not play)"
    status=1
  else
    echo "seconds: $seconds (limit $MAX_SECONDS)"
    if awk -v s="$seconds" -v m="$MAX_SECONDS" 'BEGIN { exit !(s > m) }'; then
      echo "length: OVER the limit"
      status=1
    fi
  fi
else
  echo "seconds: unknown (ffprobe not installed; Cuddler measures it on upload)"
fi

exit "$status"

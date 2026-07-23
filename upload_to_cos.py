"""
upload_to_cos.py

Uploads the built app (app/dist/) to Tencent Cloud COS under a
jasper-artbox/ prefix, alongside the table-tennis-calendar feeds in the
same bucket. Run after `npm run build` has produced app/dist/.

Required environment variables:
  TENCENT_SECRET_ID   - COS sub-user SecretId
  TENCENT_SECRET_KEY  - COS sub-user SecretKey
  TENCENT_BUCKET      - Bucket name, e.g. crslaisa-1449771562
  TENCENT_REGION      - Region, e.g. ap-guangzhou
"""

import os
import sys
from pathlib import Path
from qcloud_cos import CosConfig, CosS3Client

PREFIX = "jasper-artbox"
DIST_DIR = Path("app/dist")

CONTENT_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json",
    ".webmanifest": "application/manifest+json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
}

# Long cache for hashed, content-addressed files; short/no cache for the
# entry points that reference them (so updates roll out immediately).
NO_CACHE_FILES = {"index.html", "manifest.webmanifest", "sw.js", "registerSW.js"}


def main():
    secret_id = os.environ.get("TENCENT_SECRET_ID")
    secret_key = os.environ.get("TENCENT_SECRET_KEY")
    bucket = os.environ.get("TENCENT_BUCKET")
    region = os.environ.get("TENCENT_REGION")

    if not all([secret_id, secret_key, bucket, region]):
        print("ERROR: Missing required environment variables.")
        sys.exit(1)

    if not DIST_DIR.is_dir():
        print(f"ERROR: {DIST_DIR} not found. Run `npm run build` in app/ first.")
        sys.exit(1)

    config = CosConfig(Region=region, SecretId=secret_id, SecretKey=secret_key)
    client = CosS3Client(config)

    files = sorted(p for p in DIST_DIR.rglob("*") if p.is_file())
    if not files:
        print("No files found to upload.")
        sys.exit(0)

    for local_path in files:
        rel = local_path.relative_to(DIST_DIR).as_posix()
        key = f"{PREFIX}/{rel}"
        content_type = CONTENT_TYPES.get(local_path.suffix.lower(), "application/octet-stream")
        cache_control = "no-cache" if local_path.name in NO_CACHE_FILES else "public, max-age=31536000, immutable"
        print(f"Uploading {local_path} -> cos://{bucket}/{key}")
        with open(local_path, "rb") as f:
            client.put_object(
                Bucket=bucket,
                Body=f,
                Key=key,
                ContentType=content_type,
                CacheControl=cache_control,
            )
        print(f"  OK: https://{bucket}.cos.{region}.myqcloud.com/{key}")

    print(f"Done. Uploaded {len(files)} file(s) under {PREFIX}/.")


if __name__ == "__main__":
    main()

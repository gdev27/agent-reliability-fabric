"""Run git filter-repo to strip Cursor co-author trailers from all commit messages. Invoked from repo root."""
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# Bytes-safe message rewrite (git-filter-repo injects `message` as bytes).
CALLBACK = (
    "lines = message.split(b'\\n'); "
    "out = [l for l in lines if not ("
    "l.strip().lower().startswith(b'co-authored-by: cursor') or "
    "l.strip().lower().startswith(b'made-with: cursor')"
    ")]; "
    "return b'\\n'.join(out)"
)


def main() -> None:
    git_exe = "git"
    cmd = [git_exe, "filter-repo", "--force", "--message-callback", CALLBACK]
    print("Running:", " ".join(cmd[:4]), "...")
    r = subprocess.run(cmd, cwd=ROOT)
    sys.exit(r.returncode)


if __name__ == "__main__":
    main()

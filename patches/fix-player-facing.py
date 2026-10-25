#!/usr/bin/env python3
"""Correct Alcide's direction mapping in the verified v0.8 game.js."""

import argparse
from pathlib import Path


REPLACEMENTS = (
    (
        b"facing=Math.abs(dx)>Math.abs(dy)?dx>0?6:9:dy>0?0:3;",
        b"facing=Math.abs(dx)>Math.abs(dy)?dx>0?9:6:dy>0?3:0;",
    ),
    (b",facing=0,moving=false,", b",facing=3,moving=false,"),
)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("game_js", type=Path)
    args = parser.parse_args()
    try:
        source = args.game_js.read_bytes()
        # Validate every fragment before writing, so a mismatch leaves the file intact.
        for original, _ in REPLACEMENTS:
            count = source.count(original)
            if count != 1:
                parser.exit(
                    1,
                    f"Error: {args.game_js}: expected exactly one occurrence of "
                    f"{original.decode('ascii')!r}; found {count}. "
                    "Unsupported or already patched game.js; no changes written.\n",
                )
        for original, corrected in REPLACEMENTS:
            source = source.replace(original, corrected, 1)
        args.game_js.write_bytes(source)
    except OSError as error:
        parser.exit(1, f"Error: {args.game_js}: {error}\n")
    print(f"Patched {args.game_js}: north=0, south=3, west=6, east=9; initial=south")


if __name__ == "__main__":
    main()

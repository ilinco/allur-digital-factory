#!/usr/bin/env python3
"""Convenience entry point for running the database seed script."""

import sys
from pathlib import Path

# Add src to python path if run directly
src_path = Path(__file__).parent / 'src'
if str(src_path) not in sys.path:
	sys.path.insert(0, str(src_path))

from allur_factory.scripts.seed import cli

if __name__ == '__main__':
	cli()

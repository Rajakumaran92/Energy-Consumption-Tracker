#!/usr/bin/env python
import os
import sys

if __name__ == "__main__":
	# Ensure backend is in the Python path so Django can find energytracker
	sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
	os.environ.setdefault("DJANGO_SETTINGS_MODULE", "energytracker.settings")
	from django.core.management import execute_from_command_line
	execute_from_command_line(sys.argv)

import csv
import os
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from consumption.models import Upload, EnergyRecord

class Command(BaseCommand):
    help = 'Import sample CSV data into Upload and EnergyRecord tables.'

    def handle(self, *args, **options):
        # Create a demo user if not exists
        user, _ = User.objects.get_or_create(username='demo')

        # Create an Upload instance
        upload = Upload.objects.create(user=user, file='sample_data/sample.csv')

        # Path to sample CSV using project root
        project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))
        csv_path = os.path.join(project_root, 'sample_data', 'sample.csv')

        with open(csv_path, newline='') as csvfile:
            reader = csv.reader(csvfile)
            for row in reader:
                if len(row) != 5:
                    continue
                name, city, energy_consumption, date, price = row
                EnergyRecord.objects.create(
                    upload=upload,
                    name=name,
                    city=city,
                    energy_consumption=energy_consumption,
                    date=date,
                    price=price
                )

        self.stdout.write(self.style.SUCCESS('Sample data imported successfully.'))

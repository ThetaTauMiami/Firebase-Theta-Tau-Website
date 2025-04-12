# functions/pointsSystem.py

import os
import gspread
from google.oauth2 import service_account
from firebase_admin import firestore
from typing import Dict, Any, Optional

# Constants
SPREADSHEET_ID = "15B3JMrCT4W5-85NH6kMwjjEIxXyb_sjQ8A11wjBmCIQ"

# Path to your service account file for local development
# To get your own service account file, go to Firebase Console > Project Settings > Service accounts
                                            # > All Service Accounts > go to service account starting with "firebase-adminsdk-6ipvf" > Download JSON, put in root directory.
# BE SURE TO ADD THE JSON TO .gitignore if not automatically
SERVICE_ACCOUNT_PATH = '/Users/alecbyrd/WebstormProjects/Firebase-Theta-Tau-Website/thetataumiamiuniversity-d792532dca8f.json'

def get_brother_points_from_sheet(service_account_info=None):
    """Fetch data from Google Sheets using service account authentication"""
    try:
        # Create Google Sheets client
        scopes = ['https://www.googleapis.com/auth/spreadsheets']

        if service_account_info:
            credentials = service_account.Credentials.from_service_account_info(
                service_account_info,
                scopes=scopes
            )
        else:
            credentials = service_account.Credentials.from_service_account_file(
                SERVICE_ACCOUNT_PATH,
                scopes=scopes
            ) if os.path.exists(SERVICE_ACCOUNT_PATH) else None

            if not credentials:
                credentials = service_account.Credentials.from_compute_engine()

        # Connect to Google Sheets
        gc = gspread.authorize(credentials)

        spreadsheet = gc.open_by_key(SPREADSHEET_ID)
        sheet = spreadsheet.get_worksheet(0)
        all_rows = sheet.get_all_values()

        # Skip the header row
        data = []
        for row in all_rows[1:]:
            if not row or len(row) < 6:
                continue

            data.append({
                "name": row[0],
                "brotherhood": row[1],
                "service": row[2],
                "pd": row[3],
                "general": row[4],
                "dei": row[5]
            })

        return data
    except Exception as e:
        print(f"Error fetching data from sheets: {e}")
        raise

def update_user_points(user_points: Dict[str, Any]) -> Optional[bool]:
    """Update user points in Firestore with type enforcement"""
    try:
        # Get Firestore database instance
        db = firestore.client()
        user_name: str = str(user_points["name"])

        # Convert all point values to integers with fallback to 0
        user_brotherhood: int = int(user_points["brotherhood"]) if user_points["brotherhood"] else 0
        user_service: int = int(user_points["service"]) if user_points["service"] else 0
        user_pd: int = int(user_points["pd"]) if user_points["pd"] else 0
        user_general: int = int(user_points["general"]) if user_points["general"] else 0

        # Ensure dei is a string and convert to boolean
        if isinstance(user_points["dei"], str):
            user_dei: bool = user_points["dei"].lower() not in ('false', 'f', 'no', 'n', '0')
        else:
            user_dei: bool = bool(user_points["dei"])

        # Split the name into first and last name
        name_parts = user_name.split(" ")
        if len(name_parts) < 2:
            print(f"Error: Invalid name format for {user_name}")
            return None

        user_first_name: str = name_parts[0]
        user_last_name: str = name_parts[1]

        # Query Firestore for the user
        user_ref = db.collection("userData")
        query = user_ref.where("firstname", "==", user_first_name).where("lastname", "==", user_last_name)
        docs = query.get()

        if not docs:
            return None

        # Update the first matching document
        doc_ref = docs[0].reference
        doc_ref.update({
            "brotherhoodPoints": user_brotherhood,
            "servicePoints": user_service,
            "pdPoints": user_pd,
            "generalPoints": user_general,
            "deiFulfilled": user_dei
        })

        print(f"User points updated for {user_name}, DEI fulfilled: {user_dei}")
        return True

    except Exception as error:
        print(f"Error updating user points: {error}")
        return None

def set_all_users_dei_false():
    """Set all users' DEI points to false"""
    db = firestore.client()
    try:
        user_ref = db.collection("userData")
        docs = user_ref.stream()

        for doc in docs:
            doc_ref = doc.reference
            doc_ref.update({
                "deiFulfilled": False
            })

        print("All users' DEI points set to false")

    except Exception as error:
        print(f"Error setting DEI points: {error}")
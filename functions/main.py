import os
import json
import firebase_admin
from firebase_admin import credentials, firestore
import functions_framework
import gspread
from google.oauth2 import service_account
from dotenv import load_dotenv
from typing import Dict, Union, Any, Optional


# Path to your service account file
SERVICE_ACCOUNT_PATH = '/Users/alecbyrd/WebstormProjects/Firebase-Theta-Tau-Website/thetataumiamiuniversity-d792532dca8f.json'

# Load environment variables from .env file
load_dotenv()

# For cloud deployment, use environment variables or secrets
service_account_json = os.environ.get('SERVICE_ACCOUNT')
SERVICE_ACCOUNT_INFO = json.loads(service_account_json)
cred = credentials.Certificate(SERVICE_ACCOUNT_INFO)
firebase_admin.initialize_app(cred)

# Get Firestore database instance
db = firestore.client()

# Configure spreadsheet ID - you should set this in environment variables
SPREADSHEET_ID = os.environ.get('SPREADSHEET_ID')

def get_brother_points_from_sheet():
    """Fetch data from Google Sheets using service account authentication"""
    # Create Google Sheets client with same service account
    scopes = ['https://www.googleapis.com/auth/spreadsheets']

    # Use the same service account for Google Sheets
    credentials = service_account.Credentials.from_service_account_info(
        SERVICE_ACCOUNT_INFO,
        scopes=scopes
    )

    # Connect to Google Sheets
    gc = gspread.authorize(credentials)
    print(SPREADSHEET_ID)
    spreadsheet = gc.open_by_key(SPREADSHEET_ID)

    # Get the first worksheet
    sheet = spreadsheet.get_worksheet(0)

    # Get all values including headers
    all_rows = sheet.get_all_values()

    # Skip the header row
    data = []
    for row in all_rows[1:]:  # Skip header row
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

def update_user_points(user_points: Dict[str, Any]) -> Optional[bool]:
    """
    Update user points in Firestore with type enforcement

    Args:
        user_points: Dictionary containing user data with keys 'name', 'brotherhood',
                    'service', 'pd', 'general', and 'dei'

    Returns:
        True if update successful, None if user not found or error occurred
    """
    try:
        user_name: str = str(user_points["name"])

        # Convert all point values to integers with fallback to 0
        user_brotherhood: int = int(user_points["brotherhood"]) if user_points["brotherhood"] else 0
        user_service: int = int(user_points["service"]) if user_points["service"] else 0
        user_pd: int = int(user_points["pd"]) if user_points["pd"] else 0
        user_general: int = int(user_points["general"]) if user_points["general"] else 0

        # Ensure dei is a string and convert to boolean
        if isinstance(user_points["dei"], str):
            # Convert string to lowercase and check
            user_dei: bool = user_points["dei"].lower() not in ('false', 'f', 'no', 'n', '0')
        else:
            # For non-string inputs, use standard bool conversion
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
            # print(f"No document found for name: {user_name}")
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

@functions_framework.http
def update_points_from_sheet(request):
    """HTTP Cloud Function to update points from Google Sheets to Firestore"""
    try:
        data = get_brother_points_from_sheet()
        print(f"Successfully processed {len(data)} rows")

        for person in data:
            try:
                update_user_points(person)
            except Exception as err:
                print(f"Error updating user points: {err}")

        return ("Points updated successfully", 200)
    except Exception as err:
        print(f"Error in sheet processing: {err}")
        return (f"Error: {str(err)}", 500)


def set_all_users_dei_false():
    """Set all users' DEI points to false"""
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

# For local testing (optional)
if __name__ == "__main__":
    data = get_brother_points_from_sheet()
    print(f"Found {len(data)} records")
    for person in data:
        update_user_points(person)

    print("Local test completed")
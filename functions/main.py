import os
import json
import firebase_admin
from firebase_admin import credentials, firestore
from firebase_functions import https_fn, scheduler_fn
import gspread
from google.oauth2 import service_account
from dotenv import load_dotenv
from typing import Dict, Any, Optional
from google.cloud import secretmanager

# Path to your service account file for local development
SERVICE_ACCOUNT_PATH = '/Users/alecbyrd/WebstormProjects/Firebase-Theta-Tau-Website/thetataumiamiuniversity-d792532dca8f.json'

# Load environment variables from .env file (for local development)
load_dotenv()

# Initialize Firebase and get credentials
try:
    # First, determine if we're running in Cloud Functions
    in_cloud = os.environ.get('K_SERVICE') is not None
    if in_cloud:
        print("Running in Cloud Functions environment")
        try:
            # Try to get credentials from Secret Manager
            # print("Trying secret manager")
            client = secretmanager.SecretManagerServiceClient()
            # print("Trying service account")
            name = "projects/752928414181/secrets/service-account-credentials/versions/1"
            response = client.access_secret_version(request={"name": name})
            service_account_json = response.payload.data.decode("UTF-8")
            SERVICE_ACCOUNT_INFO = json.loads(service_account_json)
            cred = credentials.Certificate(SERVICE_ACCOUNT_INFO)
            print("Using credentials from Secret Manager")
        except Exception as e:
            print(f"Could not get credentials from Secret Manager: {e}")
            # Fall back to default credentials in GCP
            cred = None
    else:
        # Local development - use .env or local file
        service_account_json = os.environ.get('SERVICE_ACCOUNT')
        if service_account_json:
            SERVICE_ACCOUNT_INFO = json.loads(service_account_json)
            cred = credentials.Certificate(SERVICE_ACCOUNT_INFO)
            print("Using credentials from environment variable")
        else:
            # Try to use the local service account file
            try:
                cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
                print("Using credentials from local file")
            except Exception as e:
                print(f"Could not load credentials from file: {e}")
                cred = None

    # Initialize the app with credentials or default
    if cred:
        firebase_admin.initialize_app(cred)
    else:
        # Use default credentials
        firebase_admin.initialize_app()
        print("Using default credentials")

    # Get Firestore database instance
    db = firestore.client()

    # Get spreadsheet ID - prioritize environment variable, then try loading from config
    SPREADSHEET_ID = "15B3JMrCT4W5-85NH6kMwjjEIxXyb_sjQ8A11wjBmCIQ"

except Exception as e:
    print(f"Error during initialization: {e}")
    raise e

def get_brother_points_from_sheet():
    """Fetch data from Google Sheets using service account authentication"""
    try:
        # Create Google Sheets client
        scopes = ['https://www.googleapis.com/auth/spreadsheets']

        # First check if we have the SERVICE_ACCOUNT_INFO in global scope
        if 'SERVICE_ACCOUNT_INFO' in globals():
            # Use the credentials from our saved info
            credentials = service_account.Credentials.from_service_account_info(
                SERVICE_ACCOUNT_INFO,
                scopes=scopes
            )
            print("Using service account info from global scope for Sheets")
        else:
            # Try to use application default credentials
            credentials = service_account.Credentials.from_service_account_file(
                SERVICE_ACCOUNT_PATH,
                scopes=scopes
            ) if os.path.exists(SERVICE_ACCOUNT_PATH) else None

            if not credentials:
                print("Using default credentials for Sheets")
                credentials = service_account.Credentials.from_compute_engine()

        # Connect to Google Sheets
        gc = gspread.authorize(credentials)

        if not SPREADSHEET_ID:
            raise ValueError("SPREADSHEET_ID environment variable is not set")

        print(f"Using spreadsheet ID: {SPREADSHEET_ID}")
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
    except Exception as e:
        print(f"Error fetching data from sheets: {e}")
        raise

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

@scheduler_fn.on_schedule(schedule="every 6 hours")
def update_points_from_sheet_scheduled(event):
    """Scheduled Cloud Function to update points from Google Sheets to Firestore every 6 hours"""
    try:
        data = get_brother_points_from_sheet()
        print(f"Successfully processed {len(data)} rows")

        for person in data:
            try:
                update_user_points(person)
            except Exception as err:
                print(f"Error updating user points: {err}")

        print("Scheduled function completed: Points updated successfully")
        return None
    except Exception as err:
        print(f"Error in scheduled sheet processing: {err}")
        raise err

# Keeping the HTTP version as a backup/alternative way to trigger the function
@https_fn.on_request()
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
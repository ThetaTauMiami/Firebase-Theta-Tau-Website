# functions/main.py

import os
import json
import firebase_admin
from firebase_admin import credentials
from firebase_functions import https_fn, scheduler_fn
from google.cloud import secretmanager
from dotenv import load_dotenv

# Import the modular functions
from createAccount import create_account_function
from pointsSystem import (
    get_brother_points_from_sheet,
    update_user_points,
    set_all_users_dei_false
)


# Path to your service account file for local development
# To get your own service account file, go to Firebase Console > Project Settings > Service accounts > All Service Accounts > go to service account starting with "firebase-adminsdk-6ipvf" > Download JSON, put in root directory.  BE SURE TO ADD TO .gitignore if not automatically
SERVICE_ACCOUNT_PATH = '/Users/alecbyrd/WebstormProjects/Firebase-Theta-Tau-Website/thetataumiamiuniversity-d792532dca8f.json'

# Load environment variables from .env file (for local development)
load_dotenv()

# Initialize Firebase with appropriate credentials
def initialize_firebase():
    try:
        # First, determine if we're running in Cloud Functions
        in_cloud = os.environ.get('K_SERVICE') is not None
        if in_cloud:
            print("Running in Cloud Functions environment")
            try:
                # Try to get credentials from Secret Manager
                client = secretmanager.SecretManagerServiceClient()
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
            return SERVICE_ACCOUNT_INFO if 'SERVICE_ACCOUNT_INFO' in locals() else None
        else:
            # Use default credentials
            firebase_admin.initialize_app()
            print("Using default credentials")
            return None

    except Exception as e:
        print(f"Error during initialization: {e}")
        raise e


# Initialize Firebase
service_account_info = initialize_firebase()


# Define HTTP and scheduled functions
@scheduler_fn.on_schedule(schedule="every 6 hours")
def update_points_from_sheet_scheduled(event):
    """Scheduled Cloud Function to update points from Google Sheets to Firestore every 6 hours"""
    try:
        data = get_brother_points_from_sheet(service_account_info)
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

@https_fn.on_request()
def update_points_from_sheet(request):
    """HTTP Cloud Function to update points from Google Sheets to Firestore"""
    try:
        data = get_brother_points_from_sheet(service_account_info)
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

# @https_fn.on_request() disabled only for local use
def reset_dei_points(request):
    """HTTP Cloud Function to reset all users' DEI points to false"""
    try:
        set_all_users_dei_false()
        return ("DEI points reset successfully", 200)
    except Exception as err:
        print(f"Error resetting DEI points: {err}")
        return (f"Error: {str(err)}", 500)

@https_fn.on_request()
def create_account(request):
    """HTTP Cloud Function to create a new user account"""
    return create_account_function(request)

# For local testing (optional)
if __name__ == "__main__":
    data = get_brother_points_from_sheet(service_account_info)
    print(f"Found {len(data)} records")
    for person in data:
        update_user_points(person)

    print("Local test completed")
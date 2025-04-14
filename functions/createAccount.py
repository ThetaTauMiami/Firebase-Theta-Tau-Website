# functions/CreateAccount.py
import json
import firebase_admin
from firebase_admin import auth, firestore, credentials
from flask import jsonify, Request
from typing import Dict, Any, Tuple, Union, Optional, List, cast

from google.cloud import secretmanager

_gc_secret = None

def initialize_gc_secret():
    # Try to get credentials from Secret Manager
    client = secretmanager.SecretManagerServiceClient()
    name = "projects/752928414181/secrets/gc-name-secret/versions/1"
    response = client.access_secret_version(request={"name": name})
    secret = response.payload.data.decode("UTF-8")
    return secret

def get_gc_secret():
    global _gc_secret
    if _gc_secret is None:
        _gc_secret = initialize_gc_secret()
    return _gc_secret



def create_account_function(request: Request) -> Tuple[Union[str, Dict[str, Any]], int, Dict[str, str]]:
    """
    Firebase Cloud Function to handle account creation with verification.

    Args:
        request: The HTTP request object

    Returns:
        A tuple containing (response_body, status_code, headers)
    """
    # Set CORS headers for preflight requests
    cors_headers: Dict[str, str] = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '3600'
    }

    if request.method == 'OPTIONS':
        return ('', 204, cors_headers)

    try:
        # Get request data
        request_json: Optional[Dict[str, Any]] = request.get_json()

        if not request_json:
            return jsonify({'success': False, 'message': 'No data provided'}), 400, cors_headers

        # Extract fields
        email: Optional[str] = request_json.get('email')
        password: Optional[str] = request_json.get('password')
        gcName: Optional[str] = request_json.get('gcName')

        # Validate required fields
        required_fields: List[Optional[str]] = [email, password, gcName]
        if not all(required_fields):
            return jsonify({'success': False, 'message': 'Missing required fields'}), 400, cors_headers

        # Cast to proper types (we've validated they exist)
        email_str: str = cast(str, email)
        password_str: str = cast(str, password)
        gc_str: str = cast(str, gcName)


        correct_gc_name: str = get_gc_secret()

        if gc_str.lower().strip() != correct_gc_name.lower().strip():
            return jsonify({'success': False, 'message': 'Incorrect verification answer'}), 403, cors_headers

        # Initialize Firebase if not already initialized
        if not firebase_admin._apps:
            firebase_admin.initialize_app()

        # Create the user in Firebase Auth
        user_record: auth.UserRecord = auth.create_user(
            email=email_str,
            password=password_str
        )

        # Add user data to Firestore
        db: firestore.Client = firestore.client()
        db.collection('userData').document(user_record.uid).set({
            'email': email_str,
            'created_at': firestore.SERVER_TIMESTAMP,
            'brotherhoodPoints': 0,
            'deiFulfilled': False,
            'earlyAlum': False,
            'firstname': '',
            'fratclass': '',
            'generalPoints': 0,
            'githubLink': '',
            'gradYear': '',
            'lastname': '',
            'linkedinLink': '',
            'major': '',
            'minor': '',
            'pdPoints': 0,
            'personalLink': '',
            'pictureLink': '',
            'servicePoints': 0,
            'uid': user_record.uid
        })

        return jsonify({'success': True, 'uid': user_record.uid}), 200, cors_headers
    except firebase_admin.auth.EmailAlreadyExistsError:
        # Handle the duplicate email case
        return jsonify({'success': False, 'message': 'An account with this email already exists'}), 400, cors_headers
    except Exception as e:
        # Handle errors
        error_message: str = str(e)
        # Log the detailed error message
        print(f"Error: {error_message}")
        return jsonify({'success': False, 'message': 'An internal error has occurred'}), 500, cors_headers



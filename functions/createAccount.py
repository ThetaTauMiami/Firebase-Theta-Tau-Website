# functions/CreateAccount.py
import json
import firebase_admin
from firebase_admin import auth, firestore, credentials
from flask import jsonify, Request
from typing import Dict, Any, Tuple, Union, Optional, List, cast

from google.cloud import secretmanager

_h_t_secret = None

def initialize_h_t_secret():
    # Try to get credentials from Secret Manager
    client = secretmanager.SecretManagerServiceClient()
    name = "projects/752928414181/secrets/theta-tau-secret-h-t/versions/1"
    response = client.access_secret_version(request={"name": name})
    secret = response.payload.data.decode("UTF-8")
    return secret

def get_h_t_secret():
    global _h_t_secret
    if _h_t_secret is None:
        _h_t_secret = initialize_h_t_secret()
    return _h_t_secret



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
        meaning_of_h_and_t: Optional[str] = request_json.get('meaningOfHAndT')

        # Validate required fields
        required_fields: List[Optional[str]] = [email, password, meaning_of_h_and_t]
        if not all(required_fields):
            return jsonify({'success': False, 'message': 'Missing required fields'}), 400, cors_headers

        # Cast to proper types (we've validated they exist)
        email_str: str = cast(str, email)
        password_str: str = cast(str, password)
        meaning_str: str = cast(str, meaning_of_h_and_t)


        correct_meaning: str = get_h_t_secret()

        if meaning_str.lower().strip() != correct_meaning.lower().strip():
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
        db.collection('users').document(user_record.uid).set({
            'email': email_str,
            'created_at': firestore.SERVER_TIMESTAMP
        })

        return jsonify({'success': True, 'uid': user_record.uid}), 200, cors_headers

    except Exception as e:
        # Handle errors
        error_message: str = str(e)
        return jsonify({'success': False, 'message': error_message}), 500, cors_headers



import tempfile
import os
from flask import Request, jsonify
from typing import Dict
from PIL import Image

import firebase_admin
from firebase_admin import credentials, firestore, storage, initialize_app, auth

# Initialize Firebase Admin (if not already initialized)
if not firebase_admin._apps:
    initialize_app()

# Target size
TARGET_SIZE = (331, 496)

def upload_profile_photo(request: Request):
    # CORS headers
    cors_headers: Dict[str, str] = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '3600'
    }

    if request.method == 'OPTIONS':
        return ('', 204, cors_headers)

    try:
        # Validate input
        if not request.files or 'photo' not in request.files:
            return jsonify({'success': False, 'message': 'Missing photo file'}), 400, cors_headers

        file = request.files['photo']
        uid = request.form.get('uid')  # This should be passed securely from the frontend

        if not uid:
            return jsonify({'success': False, 'message': 'Missing UID'}), 400, cors_headers

        # Validate user
        auth.get_user(uid)

        # Check file type
        if file.content_type not in ['image/jpeg', 'image/png']:
            return jsonify({'success': False, 'message': 'Invalid file type'}), 400, cors_headers

        # Open, crop, and resize
        img = Image.open(file.stream)
        img = img.convert("RGB")
        img = img.resize(TARGET_SIZE, Image.LANCZOS)

        # Save to temp
        temp = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
        img.save(temp.name, format='JPEG')

        # Upload to Firebase Storage
        bucket = storage.bucket()
        blob = bucket.blob(f"Profile-Photos/{uid}.jpg")
        blob.upload_from_filename(temp.name, content_type='image/jpeg')
        blob.make_public()

        os.remove(temp.name)

        # Update Firestore userData document
        db = firestore.client()
        user_docs = db.collection('userData').where('uid', '==', uid).get()
        if not user_docs:
            return jsonify({'success': False, 'message': 'User not found in Firestore'}), 404, cors_headers

        user_doc = user_docs[0]
        user_doc.reference.update({'pictureLink': blob.public_url})

        return jsonify({'success': True, 'url': blob.public_url}), 200, cors_headers

    except Exception as e:
        import traceback
        print("Upload error:", traceback.format_exc())  # Log the full stack trace on the server
        return jsonify({'success': False, 'message': 'An internal error occurred.'}), 500, cors_headers
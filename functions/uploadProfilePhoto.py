
import os
import tempfile
from flask import Request, jsonify
from PIL import Image
import firebase_admin
from firebase_admin import auth, firestore, storage, initialize_app

def upload_profile_photo(request: Request):
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '3600'
    }

    if request.method == 'OPTIONS':
        return ('', 204, cors_headers)

    try:
        file = request.files.get('photo')
        uid = request.form.get('uid')

        if not file or not uid:
            return jsonify({'success': False, 'message': 'Missing photo or UID'}), 400, cors_headers

        if file.content_type not in ['image/jpeg', 'image/png']:
            return jsonify({'success': False, 'message': 'Invalid file type'}), 400, cors_headers

        auth.get_user(uid)
        
        img = Image.open(file.stream).convert("RGB")

        temp = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
        img.save(temp.name, format='JPEG')

        # Upload to Firebase Storage
        blob = storage.bucket().blob(f"Profile-Photos/{uid}.jpg")
        blob.upload_from_filename(temp.name, content_type='image/jpeg')
        blob.make_public()
        os.remove(temp.name)

        # Update Firestore
        user_doc = next(iter(firestore.client()
                            .collection('userData')
                            .where('uid', '==', uid)
                            .get()), 
                            None
                        )
        if not user_doc:
            return jsonify({'success': False, 'message': 'User not found'}), 404, cors_headers

        user_doc.reference.update({'pictureLink': blob.public_url})
        return jsonify({'success': True, 'url': blob.public_url}), 200, cors_headers

    except Exception as e:
        import traceback
        print("Upload error:", traceback.format_exc())
        return jsonify({'success': False, 'message': 'An internal error occurred.'}), 500, cors_headers

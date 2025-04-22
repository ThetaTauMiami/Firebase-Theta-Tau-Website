
import os
import tempfile
from flask import Request, jsonify
from PIL import Image
import firebase_admin
from firebase_admin import auth, firestore, storage, initialize_app

BASE_SIZE = (331, 496)
BASE_RATIO = BASE_SIZE[0] / BASE_SIZE[1]

def smart_crop(image: Image.Image) -> Image.Image:
    width, height = image.size
    current_ratio = width / height

    if current_ratio > BASE_RATIO:
        new_width = int(height * BASE_RATIO)
        left = (width - new_width) // 2
        box = (left, 0, left + new_width, height)
    else:
        new_height = int(width / BASE_RATIO)
        top = (height - new_height) // 2
        box = (0, top, width, top + new_height)

    return image.crop(box)

def scale_to_multiple(image: Image.Image) -> Image.Image:
    width, height = image.size
    multiplier = max(min(width // BASE_SIZE[0], height // BASE_SIZE[1]), 1)
    target_size = (BASE_SIZE[0] * multiplier, BASE_SIZE[1] * multiplier)
    return image.resize(target_size, Image.LANCZOS)

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

        # Process image with smart crop then scale
        img = Image.open(file.stream).convert("RGB")
        img = smart_crop(img)
        img = scale_to_multiple(img)

        temp = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
        img.save(temp.name, format='JPEG')

        # Upload to Firebase Storage
        blob = storage.bucket().blob(f"Profile-Photos/{uid}.jpg")
        blob.upload_from_filename(temp.name, content_type='image/jpeg')
        blob.make_public()
        os.remove(temp.name)

        # Update Firestore
        user_doc = next(iter(firestore.client().collection('userData').where('uid', '==', uid).get()), None)
        if not user_doc:
            return jsonify({'success': False, 'message': 'User not found'}), 404, cors_headers

        user_doc.reference.update({'pictureLink': blob.public_url})
        return jsonify({'success': True, 'url': blob.public_url}), 200, cors_headers

    except Exception as e:
        import traceback
        print("Upload error:", traceback.format_exc())
        return jsonify({'success': False, 'message': 'An internal error occurred.'}), 500, cors_headers

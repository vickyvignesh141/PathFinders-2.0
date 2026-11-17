
from flask import Blueprint, request, jsonify
from app.db import db

profile_bp = Blueprint("profile", __name__)

volunteers_collection = db["volunteers"]


@profile_bp.route("/<username>", methods=["PUT"])
def save_student_profile(username):
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "Profile data is required"
            }), 400

        username = username.strip().upper()

        volunteer = volunteers_collection.find_one({
            "username": username,
            "role": {"$in": ["student", "alumni"]}
        })

        if not volunteer:
            return jsonify({
                "success": False,
                "message": "Student account not found"
            }), 404

        full_name = data.get("fullName", "").strip()

        if not full_name:
            return jsonify({
                "success": False,
                "message": "Full name is required"
            }), 400

        profile_fields = {
            "fullName": full_name,
            "name": full_name,
            "dob": data.get("dob", ""),
            "gender": data.get("gender", ""),
            "address": data.get("location", ""),
            "phone": data.get("mobile", ""),
            "email": data.get("email", ""),
            "college": data.get("college", ""),
            "collegeLocation": data.get("collegeLocation", ""),
            "zone": data.get("zone", ""),
            "department": data.get("department", ""),
            "degree": data.get("degree", ""),
            "year": data.get("year", ""),
            "batch": data.get("batch", ""),
            "residenceType": data.get("accommodation", ""),
            "linkedin": data.get("linkedin", ""),
            "profileCompleted": True
        }

        volunteers_collection.update_one(
            {"username": username},
            {"$set": profile_fields}
        )

        return jsonify({
            "success": True,
            "message": "Student profile saved successfully"
        }), 200

    except Exception as e:
        print("Profile save error:", e)

        return jsonify({
            "success": False,
            "message": "Failed to save profile"
        }), 500

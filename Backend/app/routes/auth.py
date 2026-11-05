
from flask import Blueprint, request, jsonify
from app.db import db
# from werkzeug.security import generate_password_hash, check_password_hash
import re

auth_bp = Blueprint("auth", __name__)


# =========================
# LOGIN
# =========================

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Request body is required"
        }), 400

    username = data.get("username", "").strip().upper()
    password = data.get("password", "")
    role = data.get("role", "").strip().lower()

    if not username or not password or not role:
        return jsonify({
            "success": False,
            "message": "Username, password and role are required"
        }), 400

    if role not in ["student", "alumni", "director", "admin"]:
        return jsonify({
            "success": False,
            "message": "Invalid role"
        }), 400

    # Select collection based on role
    if role == "admin":

        if not re.fullmatch(r"MAA4\d{5}", username):
            return jsonify({
                "success": False,
                "message": "Invalid admin username format"
            }), 400

        user = db.admins.find_one({
            "username": username,
            "role": "admin"
        })

    else:
        user = db.volunteers.find_one({
            "username": username,
            "role": role
        })

    # Check password
    if user and user.get("password") == password:

        return jsonify({
            "success": True,
            "message": "Login successful",
            "name": user["name"],
            "username": user["username"],
            "role": user["role"]
        }), 200

    return jsonify({
        "success": False,
        "message": "Invalid username or password"
    }), 401



# =========================
# REGISTER
# =========================

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Request body is required"
        }), 400

    name = data.get("name", "").strip()
    username = data.get("username", "").strip().upper()
    phone = data.get("phone", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    # Required field validation
    if not all([name, username, phone, email, password]):
        return jsonify({
            "success": False,
            "message": "All fields are required"
        }), 400

    # Username and role validation: 4 prefix characters + 5 digits
    if re.fullmatch(r"MAA0\d{5}", username):
        role = "student"

    elif re.fullmatch(r"MAA1\d{5}", username):
        role = "alumni"

    elif re.fullmatch(r"MAA2\d{5}", username):
        role = "director"
        
    elif re.fullmatch(r"MAA4\d{5}", username):
        return jsonify({
        "success": False,
        "message": "Admin accounts cannot register through volunteer registration."
    }), 403

    else:
        return jsonify({
            "success": False,
            "message": "Username must be MAA0, MAA1, or MAA2 followed by exactly 5 digits."
        }), 400

    # Phone validation
    if not re.fullmatch(r"\d{10}", phone):
        return jsonify({
            "success": False,
            "message": "Enter a valid 10-digit phone number"
        }), 400

    # Gmail validation
    if not re.fullmatch(r"[^@\s]+@gmail\.com", email):
        return jsonify({
            "success": False,
            "message": "Enter a valid Gmail address"
        }), 400

    # Password validation
    if len(password) < 8:
        return jsonify({
            "success": False,
            "message": "Password must contain at least 8 characters"
        }), 400

    # Check duplicate complete username, email, or phone
    existing_user = db.volunteers.find_one({
        "$or": [
            {"username": username},
            {"email": email},
            {"phone": phone}
        ]
    })

    if existing_user:
        return jsonify({
            "success": False,
            "message": "Username, email, or phone already registered"
        }), 409

    # Hash password
    # hashed_password = generate_password_hash(password)
    stored_password = password
    
    # Create volunteer document
    volunteer = {
        "name": name,
        "username": username,
        "phone": phone,
        "email": email,
        # "password": hashed_password,
        "password": stored_password,
        "role": role
    }

    # Save to MongoDB
    db.volunteers.insert_one(volunteer)

    return jsonify({
        "success": True,
        "message": "Registration successful",
        "username": username,
        "role": role
    }), 201



@auth_bp.route("/admin/register", methods=["POST"])
def admin_register():
    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Request body is required"
        }), 400

    name = data.get("name", "").strip()
    username = data.get("username", "").strip().upper()
    phone = data.get("phone", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    # Required field validation
    if not all([name, username, phone, email, password]):
        return jsonify({
            "success": False,
            "message": "All fields are required"
        }), 400

    # Admin username validation
    if not re.fullmatch(r"MAA4\d{5}", username):
        return jsonify({
            "success": False,
            "message": "Admin username must start with MAA4 followed by exactly 5 digits."
        }), 400

    # Phone validation
    if not re.fullmatch(r"\d{10}", phone):
        return jsonify({
            "success": False,
            "message": "Enter a valid 10-digit phone number"
        }), 400

    # Gmail validation
    if not re.fullmatch(r"[^@\s]+@gmail\.com", email):
        return jsonify({
            "success": False,
            "message": "Enter a valid Gmail address"
        }), 400

    # Password validation
    if len(password) < 8:
        return jsonify({
            "success": False,
            "message": "Password must contain at least 8 characters"
        }), 400

    # Check duplicate username, email, or phone
    existing_admin = db.admins.find_one({
        "$or": [
            {"username": username},
            {"email": email},
            {"phone": phone}
        ]
    })

    if existing_admin:
        return jsonify({
            "success": False,
            "message": "Username, email, or phone already registered"
        }), 409

    # Store password (same as current volunteer registration)
    stored_password = password

    # Create admin document
    admin = {
        "name": name,
        "username": username,
        "phone": phone,
        "email": email,
        "password": stored_password,
        "role": "admin"
    }

    # Save to admins collection
    db.admins.insert_one(admin)

    return jsonify({
        "success": True,
        "message": "Admin registration successful",
        "username": username,
        "role": "admin"
    }), 201

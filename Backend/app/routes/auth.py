
from flask import Blueprint, request, jsonify
from app.db import db

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Request body is required"
        }), 400

    username = data.get("username")
    password = data.get("password")
    role = data.get("role")
    
    if role not in ["student", "alumini", "admin"]:
        return jsonify({
        "success": False,
        "message": "Invalid role"
    }), 400
    
    
    

    if not username or not password:
        return jsonify({
            "success": False,
            "message": "Username and password are required"
        }), 400
        
    

    volunteer = db.volunteers.find_one({
        "username": username,
        "password": password,
        "role": role
        
    })

    if volunteer:
        return jsonify({
            "success": True,
            "message": "Login successful",
            "username": volunteer["username"]
        }), 200

    return jsonify({
        "success": False,
        "message": "Invalid username or password"
    }), 401


from functools import wraps
import jwt

from flask import request, jsonify, current_app, g


def token_required(allowed_roles=None):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):

            # Allow CORS preflight requests without authentication
            if request.method == "OPTIONS":
                return "", 200

            auth_header = request.headers.get("Authorization", "")

            if not auth_header.startswith("Bearer "):
                return jsonify({
                    "success": False,
                    "message": "Authentication token is missing"
                }), 401

            token = auth_header.split(" ", 1)[1]

            try:
                payload = jwt.decode(
                    token,
                    current_app.config["JWT_SECRET_KEY"],
                    algorithms=[current_app.config["JWT_ALGORITHM"]]
                )

                username = payload.get("username")
                role = payload.get("role")

                if not username or not role:
                    raise jwt.InvalidTokenError()

                if allowed_roles and role not in allowed_roles:
                    return jsonify({
                        "success": False,
                        "message": "You are not authorized to perform this action"
                    }), 403

                g.current_user = {
                    "username": username,
                    "role": role
                }

            except jwt.ExpiredSignatureError:
                return jsonify({
                    "success": False,
                    "message": "Session expired. Please login again."
                }), 401

            except jwt.InvalidTokenError:
                return jsonify({
                    "success": False,
                    "message": "Invalid authentication token"
                }), 401

            return func(*args, **kwargs)

        return wrapper
    return decorator

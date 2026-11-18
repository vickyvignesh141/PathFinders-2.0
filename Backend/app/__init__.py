
from flask import Flask
from flask_cors import CORS
from app.config import Config
from app.db import client, db


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, resources={
        r"/api/*": {
            "origins": [
                "http://localhost:5173",
                "http://127.0.0.1:5173"
            ],
            "methods": [
                "GET", "POST", "PUT",
                "PATCH", "DELETE", "OPTIONS"
            ],
            "allow_headers": [
                "Content-Type", "Authorization"
            ]
        }
    })

    @app.route("/api/health", methods=["GET"])
    def health_check():
        return {
            "success": True,
            "message": "Server is running"
        }, 200

    return app

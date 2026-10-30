from flask import Flask
from flask_cors import CORS
from app.config import Config
from app.db import client, db

def create_app():
    app = Flask(__name__)

    app.config.from_object(Config)

    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:5173"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    @app.route("/api/health", methods=["GET"])
    def health_check():
        try:
            client.admin.command("ping")
            return {
                "success": True,
                "message": "Maatram backend is running",
                "database": db.name,
                "database_status": "connected"
            }, 200
        except Exception as e:
            print(e)
            return {
                "success": False,
                "message": "Database connection failed"
            }, 500

    return app
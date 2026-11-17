
from app import create_app
from flask_cors import CORS


from app.routes.auth import auth_bp
from app.routes.createevent import events_bp

from app.routes.profile import profile_bp


from app.routes.feedback import feedback_bp

app = create_app()

CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:5173",
            "http://127.0.0.1:5173"
        ]
    }
})

app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(events_bp, url_prefix="/api/events")
app.register_blueprint(profile_bp, url_prefix="/api/profile")
app.register_blueprint(feedback_bp, url_prefix="/api/feedback")


if __name__ == "__main__":
    app.run(debug=True, port=5000)

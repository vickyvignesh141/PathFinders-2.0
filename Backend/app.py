
from app import create_app

from app.routes.auth import auth_bp
from app.routes.createevent import events_bp
from app.routes.profile import profile_bp
from app.routes.rag_createevent import rag_bp
from app.routes.feedback import feedback_bp

app = create_app()

app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(events_bp, url_prefix="/api/events")
app.register_blueprint(profile_bp, url_prefix="/api/profile")
app.register_blueprint(rag_bp, url_prefix="/api/rag")
app.register_blueprint(feedback_bp, url_prefix="/api/feedback")


if __name__ == "__main__":
    app.run(
        debug=True,
        use_reloader=False,
        threaded=True
    )

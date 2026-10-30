
from app import create_app
from app.routes.auth import auth_bp
from app.routes.createevent import events_bp

app = create_app()

app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(events_bp, url_prefix="/api/events")


if __name__ == "__main__":
    app.run(debug=True, port=5000)


from app import create_app
from app.routes.auth import auth_bp

app = create_app()


app.register_blueprint(auth_bp, url_prefix="/api/auth")


if __name__ == "__main__":
    app.run(debug=True, port=5000)

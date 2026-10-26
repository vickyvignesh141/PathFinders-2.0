
from pymongo import MongoClient
from app.config import Config

client = MongoClient(
    Config.MONGO_URI,
    serverSelectionTimeoutMS=5000
)

db = client["VOLUNTEERING_PORTAL"]

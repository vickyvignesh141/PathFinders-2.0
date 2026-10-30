from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
from app.db import db

events_bp = Blueprint("events", __name__)

# MongoDB Collection
events_collection = db["events"]


# CREATE EVENT
@events_bp.route("/", methods=["POST", "OPTIONS"])
def create_event():

    if request.method == "OPTIONS":
        return "", 200

    try:
        data = request.get_json(silent=True)

        if not data:
            return jsonify({
                "success": False,
                "message": "Invalid request data"
            }), 400

        required_fields = [
            "eventTitle",
            "eventDescription",
            "volunteerWork",
            "location",
            "date",
            "startTime",
            "endTime",
            "instructions",
            "volunteersNeeded",
            "zone",
            "startAt",
            "endAt"
        ]

        for field in required_fields:
            if field not in data or data[field] is None or str(data[field]).strip() == "":
                return jsonify({
                    "success": False,
                    "message": f"{field} is required"
                }), 400

        start_at = datetime.fromisoformat(
            data["startAt"].replace("Z", "+00:00")
        )

        end_at = datetime.fromisoformat(
            data["endAt"].replace("Z", "+00:00")
        )

        if end_at <= start_at:
            return jsonify({
                "success": False,
                "message": "End time must be after start time"
            }), 400

        volunteers_needed = int(data["volunteersNeeded"])

        if volunteers_needed < 1:
            return jsonify({
                "success": False,
                "message": "At least one volunteer is required"
            }), 400

        event = {
            "eventTitle": data["eventTitle"].strip(),
            "eventDescription": data["eventDescription"].strip(),
            "volunteerWork": data["volunteerWork"].strip(),
            "location": data["location"].strip(),

            "date": data["date"],
            "startTime": data["startTime"],
            "endTime": data["endTime"],

            "startAt": start_at,
            "endAt": end_at,

            "instructions": data["instructions"].strip(),
            "volunteersNeeded": volunteers_needed,
            "zone": data["zone"],

            "status": "upcoming",
            "createdAt": datetime.now(timezone.utc)
        }

        result = events_collection.insert_one(event)

        return jsonify({
            "success": True,
            "message": "Event created successfully!",
            "eventId": str(result.inserted_id)
        }), 201

    except (ValueError, TypeError):
        return jsonify({
            "success": False,
            "message": "Invalid date, time or volunteer count"
        }), 400

    except Exception as e:
        print("Create Event Error:", e)

        return jsonify({
            "success": False,
            "message": "Failed to create event"
        }), 500



# GET ALL EVENTS
@events_bp.route("/", methods=["GET"])
def get_events():
    try:
        events = list(
            events_collection.find().sort("date", 1)
        )

        for event in events:
            event["_id"] = str(event["_id"])

            if isinstance(event.get("startAt"), datetime):
                event["startAt"] = event["startAt"].isoformat()

            if isinstance(event.get("endAt"), datetime):
                event["endAt"] = event["endAt"].isoformat()

            if isinstance(event.get("createdAt"), datetime):
                event["createdAt"] = event["createdAt"].isoformat()

        return jsonify({
            "success": True,
            "events": events
        }), 200

    except Exception as e:
        print("Get Events Error:", e)
        return jsonify({
            "success": False,
            "message": "Failed to fetch events"
        }), 500
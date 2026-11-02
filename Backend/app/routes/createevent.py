from bson import ObjectId
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
import re
from app.db import db

events_bp = Blueprint("events", __name__)

# MongoDB Collection
events_collection = db["events"]
registrations_collection = db["registrations"]


# GENERATE UNIQUE EVENT ID
def generate_event_id(title):

    # Convert title into lowercase
    slug = title.lower().strip()

    # Replace spaces and special characters with hyphens
    slug = re.sub(r'[^a-z0-9]+', '-', slug)

    # Remove starting and ending hyphens
    slug = slug.strip('-')

    base_id = slug
    event_id = base_id
    count = 2

    # Check duplicate event IDs
    while events_collection.find_one({"eventId": event_id}):
        event_id = f"{base_id}-{count}"
        count += 1

    return event_id


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

        # Validate required fields
        for field in required_fields:

            if (
                field not in data
                or data[field] is None
                or str(data[field]).strip() == ""
            ):
                return jsonify({
                    "success": False,
                    "message": f"{field} is required"
                }), 400

        # Validate event title
        event_title = data["eventTitle"].strip()

        if not re.search(r'[a-zA-Z0-9]', event_title):
            return jsonify({
                "success": False,
                "message": "Event title must contain letters or numbers"
            }), 400

        # Convert dates
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

        # Validate volunteers
        volunteers_needed = int(data["volunteersNeeded"])

        if volunteers_needed < 1:
            return jsonify({
                "success": False,
                "message": "At least one volunteer is required"
            }), 400

        # Generate unique event ID
        event_id = generate_event_id(event_title)

        # Event document
        event = {

            "eventId": event_id,

            "eventTitle": event_title,
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

        # Save in MongoDB
        result = events_collection.insert_one(event)

        return jsonify({
            "success": True,
            "message": "Event created successfully!",
            "eventId": event_id,
            "event": {
                **event,
                "_id": str(result.inserted_id),
                "startAt": start_at.isoformat(),
                "endAt": end_at.isoformat(),
                "createdAt": event["createdAt"].isoformat()
            }
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



# ==================================
# STUDENT REGISTER FOR EVENT
# ==================================

@events_bp.route("/<event_id>/register", methods=["POST"])
def register_for_event(event_id):

    data = request.get_json(silent=True) or {}

    username = data.get("username", "").strip().upper()

    if not username:
        return jsonify({
            "success": False,
            "message": "Student username is required"
        }), 400

    # Validate MongoDB event ID
    if not ObjectId.is_valid(event_id):
        return jsonify({
            "success": False,
            "message": "Invalid event ID"
        }), 400

    # Check whether event exists
    event = events_collection.find_one({
        "_id": ObjectId(event_id)
    })

    if not event:
        return jsonify({
            "success": False,
            "message": "Event not found"
        }), 404

    # Get student details from volunteers collection
    student = db.volunteers.find_one({
        "username": username,
        "role": {"$in": ["student", "alumni"]}
    })

    if not student:
        return jsonify({
            "success": False,
            "message": "Student account not found"
        }), 404

    # Prevent duplicate registration
    existing_registration = registrations_collection.find_one({
        "eventId": ObjectId(event_id),
        "studentUsername": username
    })

    if existing_registration:
        return jsonify({
            "success": False,
            "message": "You have already registered for this event"
        }), 409

    # Create registration document
    registration = {
        "eventId": ObjectId(event_id),

        "eventTitle": event.get("eventTitle", ""),

        "studentUsername": student.get("username", ""),
        "studentName": student.get("name", ""),
        "phone": student.get("phone", ""),
        "email": student.get("email", ""),
        "role": student.get("role", ""),

        "address": student.get("address", ""),
        "residenceType": student.get("residenceType", ""),
        "previousVolunteeringWorks": student.get(
            "previousVolunteeringWorks", []
        ),

        "status": "Registered",
        "registeredAt": datetime.now(timezone.utc)
    }

    result = registrations_collection.insert_one(registration)

    return jsonify({
        "success": True,
        "message": "Event registration successful",
        "registrationId": str(result.inserted_id),
        "status": "Registered"
    }), 201


# ==================================
# GET LOGGED-IN STUDENT REGISTRATIONS
# ==================================

@events_bp.route("/student/registrations", methods=["GET"])
def get_student_registrations():

    username = request.args.get("username", "").strip().upper()

    if not username:
        return jsonify({
            "success": False,
            "message": "Student username is required"
        }), 400

    registrations = list(
        registrations_collection.find({
            "studentUsername": username
        }).sort("registeredAt", -1)
    )

    for registration in registrations:
        registration["_id"] = str(registration["_id"])
        registration["eventId"] = str(registration["eventId"])

        if registration.get("registeredAt"):
            registration["registeredAt"] = (
                registration["registeredAt"].isoformat()
            )

    return jsonify({
        "success": True,
        "registrations": registrations
    }), 200


# ==================================
# ADMIN: GET REGISTRATIONS FOR AN EVENT
# ==================================

@events_bp.route("/<event_id>/registrations", methods=["GET"])
def get_event_registrations(event_id):

    if not ObjectId.is_valid(event_id):
        return jsonify({
            "success": False,
            "message": "Invalid event ID"
        }), 400

    event = events_collection.find_one({
        "_id": ObjectId(event_id)
    })

    if not event:
        return jsonify({
            "success": False,
            "message": "Event not found"
        }), 404

    registrations = list(
        registrations_collection.find({
            "eventId": ObjectId(event_id)
        }).sort("registeredAt", -1)
    )

    for registration in registrations:
        registration["_id"] = str(registration["_id"])
        registration["eventId"] = str(registration["eventId"])

        if registration.get("registeredAt"):
            registration["registeredAt"] = (
                registration["registeredAt"].isoformat()
            )

    return jsonify({
        "success": True,
        "eventTitle": event.get("eventTitle", ""),
        "totalRegistrations": len(registrations),
        "registrations": registrations
    }), 200
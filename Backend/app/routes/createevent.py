
import re
import secrets
import hashlib
import json
import traceback

from datetime import datetime, timezone, timedelta
from pymongo.errors import DuplicateKeyError
from bson import ObjectId
from flask import Blueprint, request, jsonify, g

from app.db import db
from app.auth_utils import token_required

events_bp = Blueprint("events", __name__)

# MongoDB Collections
events_collection = db["events"]
registrations_collection = db["registrations"]
attendance_collection = db["attendance"]

# Prevent duplicate attendance for the same event and student
attendance_collection.create_index(
    [("eventId", 1), ("studentUsername", 1)],
    unique=True
)


# ==================================
# GENERATE UNIQUE EVENT ID
# ==================================

def generate_event_id(title):
    slug = title.lower().strip()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = slug.strip('-')

    base_id = slug
    event_id = base_id
    count = 2

    while events_collection.find_one({"eventId": event_id}):
        event_id = f"{base_id}-{count}"
        count += 1

    return event_id


# ==================================
# CREATE EVENT
# ==================================

@events_bp.route("/", methods=["POST"])
@token_required(["admin"])
def create_event():
    try:
        data = request.get_json(silent=True)

        if not data:
            return jsonify({
                "success": False,
                "message": "Invalid request data"
            }), 400

        event_type = data.get("eventType", "regular")

        if event_type not in ["regular", "physical_verification"]:
            return jsonify({
                "success": False,
                "message": "Invalid event type"
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
            if (
                field not in data
                or data[field] is None
                or str(data[field]).strip() == ""
            ):
                return jsonify({
                    "success": False,
                    "message": f"{field} is required"
                }), 400

        event_title = data["eventTitle"].strip()

        if not re.search(r'[a-zA-Z0-9]', event_title):
            return jsonify({
                "success": False,
                "message": "Event title must contain letters or numbers"
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

        event_id = generate_event_id(event_title)

        event = {
            "eventId": event_id,
            "eventType": event_type,
            "targetAudience": data.get("targetAudience", "students"),

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
        print("Create Event Error:", repr(e))
        return jsonify({
            "success": False,
            "message": "Failed to create event"
        }), 500


# ==================================
# GET ALL EVENTS
# ==================================

@events_bp.route("/", methods=["GET"])
def get_events():
    try:
        events = list(
            events_collection.find().sort("date", 1)
        )

        registration_counts = {}

        counts = registrations_collection.aggregate([
            {
                "$group": {
                    "_id": "$eventId",
                    "total": {"$sum": 1}
                }
            }
        ])

        for item in counts:
            registration_counts[str(item["_id"])] = item["total"]

        for event in events:
            mongo_id = str(event["_id"])

            event["registrationCount"] = registration_counts.get(
                mongo_id, 0
            )

            event["_id"] = mongo_id

            for field in ["startAt", "endAt", "createdAt"]:
                if isinstance(event.get(field), datetime):
                    event[field] = event[field].isoformat()

        return jsonify({
            "success": True,
            "events": events
        }), 200

    except Exception as e:
        print("Get Events Error:", repr(e))
        return jsonify({
            "success": False,
            "message": "Failed to fetch events"
        }), 500


# ==================================
# ADMIN: GENERATE EVENT QR CODE
# ==================================

@events_bp.route("/<event_id>/qr", methods=["POST"])
@token_required(["admin"])
def generate_event_qr(event_id):
    try:
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

        if event.get("eventType", "regular") != "regular":
            return jsonify({
                "success": False,
                "message": "QR attendance is not available for Physical Verification"
            }), 400

        start_at = event.get("startAt")
        end_at = event.get("endAt")

        if not start_at or not end_at:
            return jsonify({
                "success": False,
                "message": "Event schedule is missing"
            }), 400

        if start_at.tzinfo is None:
            start_at = start_at.replace(tzinfo=timezone.utc)

        if end_at.tzinfo is None:
            end_at = end_at.replace(tzinfo=timezone.utc)

        now = datetime.now(timezone.utc)

        qr_token = secrets.token_urlsafe(32)

        qr_token_hash = hashlib.sha256(
            qr_token.encode()
        ).hexdigest()

        events_collection.update_one(
            {"_id": ObjectId(event_id)},
            {
                "$set": {
                    "qrTokenHash": qr_token_hash,
                    "qrGeneratedAt": now,
                    "qrEnabled": True
                }
            }
        )

        return jsonify({
            "success": True,
            "message": "QR code generated successfully",
            "qrPayload": {
                "eventId": str(event["_id"]),
                "token": qr_token
            }
        }), 200

    except Exception as e:
        print("Generate QR Error:", repr(e))
        return jsonify({
            "success": False,
            "message": "Failed to generate QR code"
        }), 500


# ==================================
# STUDENT: REGISTER FOR EVENT
# ==================================

@events_bp.route("/<event_id>/register", methods=["POST"])
@token_required(["student", "alumni"])
def register_for_event(event_id):
    username = g.current_user.get("username", "").strip().upper()

    if not username:
        return jsonify({
            "success": False,
            "message": "Student username is required"
        }), 400

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

    student = db.volunteers.find_one({
        "username": username,
        "role": {"$in": ["student", "alumni"]}
    })

    if not student:
        return jsonify({
            "success": False,
            "message": "Student account not found"
        }), 404

    existing_registration = registrations_collection.find_one({
        "eventId": ObjectId(event_id),
        "studentUsername": username
    })

    if existing_registration:
        return jsonify({
            "success": False,
            "message": "You have already registered for this event"
        }), 409

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
# STUDENT: GET MY REGISTRATIONS
# ==================================

@events_bp.route("/student/registrations", methods=["GET"])
@token_required(["student", "alumni"])
def get_student_registrations():
    username = g.current_user.get("username", "").strip().upper()

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
# ADMIN: GET EVENT REGISTRATIONS
# ==================================

@events_bp.route("/<event_id>/registrations", methods=["GET"])
@token_required(["admin"])
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


# ==================================
# ADMIN: UPDATE REGISTRATION STATUS
# ==================================

@events_bp.route(
    "/registrations/<registration_id>/status",
    methods=["PATCH"]
)
@token_required(["admin"])
def update_registration_status(registration_id):
    try:
        if not ObjectId.is_valid(registration_id):
            return jsonify({
                "success": False,
                "message": "Invalid registration ID"
            }), 400

        data = request.get_json(silent=True) or {}
        status = data.get("status", "").strip().capitalize()

        if status not in ["Approved", "Rejected"]:
            return jsonify({
                "success": False,
                "message": "Status must be Approved or Rejected"
            }), 400

        result = registrations_collection.update_one(
            {"_id": ObjectId(registration_id)},
            {
                "$set": {
                    "status": status,
                    "updatedAt": datetime.now(timezone.utc)
                }
            }
        )

        if result.matched_count == 0:
            return jsonify({
                "success": False,
                "message": "Registration not found"
            }), 404

        return jsonify({
            "success": True,
            "message": f"Registration {status} successfully",
            "status": status
        }), 200

    except Exception as e:
        print("Update Registration Status Error:", repr(e))
        return jsonify({
            "success": False,
            "message": "Unable to update registration status"
        }), 500


# ==================================
# STUDENT: VERIFY EVENT QR
# ==================================

@events_bp.route("/<event_id>/attendance/verify-qr", methods=["POST"])
@token_required(["student", "alumni"])
def verify_event_qr(event_id):
    try:
        data = request.get_json(silent=True) or {}
        qr_payload = data.get("qrPayload")

        if not qr_payload or not isinstance(qr_payload, str):
            return jsonify({
                "success": False,
                "message": "QR payload is missing."
            }), 400

        try:
            qr_data = json.loads(qr_payload)
            qr_event_id = qr_data.get("eventId")
            qr_token = qr_data.get("token")

            if not isinstance(qr_token, str) or not qr_token:
                return jsonify({
                    "success": False,
                    "message": "QR token is missing or invalid."
                }), 400

        except (json.JSONDecodeError, AttributeError):
            return jsonify({
                "success": False,
                "message": "Invalid QR format."
            }), 400

        if not ObjectId.is_valid(qr_event_id):
            return jsonify({
                "success": False,
                "message": "Invalid event ID in QR."
            }), 400

        if qr_event_id != event_id:
            return jsonify({
                "success": False,
                "message": "QR does not belong to this event."
            }), 400

        event = events_collection.find_one({
            "_id": ObjectId(qr_event_id)
        })

        if not event:
            return jsonify({
                "success": False,
                "message": "Event not found."
            }), 404

        if event.get("eventType", "regular") != "regular":
            return jsonify({
                "success": False,
                "message": "Physical Verification does not use QR."
            }), 400

        if not event.get("qrEnabled"):
            return jsonify({
                "success": False,
                "message": "QR attendance is disabled."
            }), 400

        scanned_hash = hashlib.sha256(
            qr_token.encode("utf-8")
        ).hexdigest()

        stored_hash = event.get("qrTokenHash", "")

        if not stored_hash or not secrets.compare_digest(
            scanned_hash, stored_hash
        ):
            return jsonify({
                "success": False,
                "message": "Invalid QR code."
            }), 400

        # Check event time in IST
        now = datetime.now(timezone.utc).astimezone(
            timezone(timedelta(hours=5, minutes=30))
        ).replace(tzinfo=None)

        event_start = datetime.strptime(
            f"{event['date']} {event['startTime']}",
            "%Y-%m-%d %H:%M"
        )

        event_end = datetime.strptime(
            f"{event['date']} {event['endTime']}",
            "%Y-%m-%d %H:%M"
        )

        qr_start = event_start - timedelta(minutes=30)

        if now < qr_start:
            return jsonify({
                "success": False,
                "message": "QR attendance is not active yet."
            }), 400

        if now > event_end:
            return jsonify({
                "success": False,
                "message": "This event has already ended."
            }), 400

        username = g.current_user.get(
            "username", ""
        ).strip().upper()

        if not username:
            return jsonify({
                "success": False,
                "message": "Student login information is missing."
            }), 401

        registration = registrations_collection.find_one({
            "eventId": event["_id"],
            "studentUsername": username,
            "status": "Approved"
        })

        if not registration:
            return jsonify({
                "success": False,
                "message": "You are not approved for this event."
            }), 403

        # Record the exact QR check-in time
        scanned_at = datetime.now(timezone.utc)

        attendance_record = {
            "eventId": event["_id"],
            "eventCode": event["eventId"],
            "eventTitle": event.get("eventTitle"),
            "studentUsername": username,
            "studentName": registration.get("studentName"),
            "registrationId": registration["_id"],

            "attendanceStatus": "Checked In",
            "adminVerified": False,

            "scannedAt": scanned_at,
            "createdAt": scanned_at
        }

        try:
            attendance_collection.insert_one(attendance_record)

        except DuplicateKeyError:
            return jsonify({
                "success": False,
                "message": "You have already checked in for this event."
            }), 409

        return jsonify({
            "success": True,
            "message": "Attendance check-in successful.",
            "attendanceStatus": "Checked In",
            "scannedAt": scanned_at.isoformat()
        }), 201

    except Exception as e:
        print("\n========== QR VERIFICATION ERROR ==========")
        print("Error:", repr(e))
        traceback.print_exc()
        print("===========================================\n")

        return jsonify({
            "success": False,
            "message": "Unable to verify QR attendance."
        }), 500
        
        
        
# ==================================
# ADMIN: COMPLETE STUDENT EVENT
# ==================================


# ==================================
# ADMIN: COMPLETE EVENT FOR ALL STUDENTS
# ==================================

@events_bp.route(
    "/<event_id>/attendance/complete",
    methods=["PATCH"]
)
@token_required(["admin"])
def complete_all_student_attendance(event_id):
    try:
        if not ObjectId.is_valid(event_id):
            return jsonify({
                "success": False,
                "message": "Invalid event ID."
            }), 400

        event_object_id = ObjectId(event_id)

        event = events_collection.find_one({
            "_id": event_object_id
        })

        if not event:
            return jsonify({
                "success": False,
                "message": "Event not found."
            }), 404

        # Get only students who have checked in
        pending_records = list(
            attendance_collection.find({
                "eventId": event_object_id,
                "attendanceStatus": "Checked In"
            })
        )

        if not pending_records:
            return jsonify({
                "success": True,
                "message": "No pending student attendance to complete.",
                "completedCount": 0,
                "attendance": []
            }), 200

        completed_records = []
        completed_count = 0

        for record in pending_records:
            scanned_at = record.get("scannedAt")

            if not scanned_at:
                continue

            if isinstance(scanned_at, str):
                scanned_at = datetime.fromisoformat(
                    scanned_at.replace("Z", "+00:00")
                )

            if scanned_at.tzinfo is None:
                scanned_at = scanned_at.replace(
                    tzinfo=timezone.utc
                )
            else:
                scanned_at = scanned_at.astimezone(
                    timezone.utc
                )

            completed_at = datetime.now(timezone.utc)

            duration_seconds = max(
                0,
                int((completed_at - scanned_at).total_seconds())
            )

            # Conditional update prevents duplicate completion
            result = attendance_collection.update_one(
                {
                    "_id": record["_id"],
                    "eventId": event_object_id,
                    "attendanceStatus": "Checked In",
                    "completedAt": {"$exists": False}
                },
                {
                    "$set": {
                        "attendanceStatus": "Completed",
                        "adminVerified": True,
                        "completedAt": completed_at,
                        "durationSeconds": duration_seconds
                    }
                }
            )

            if result.modified_count == 1:
                completed_count += 1

                completed_records.append({
                    "_id": str(record["_id"]),
                    "studentUsername": record.get(
                        "studentUsername"
                    ),
                    "studentName": record.get(
                        "studentName"
                    ),
                    "attendanceStatus": "Completed",
                    "adminVerified": True,
                    "scannedAt": scanned_at.isoformat(),
                    "completedAt": completed_at.isoformat(),
                    "durationSeconds": duration_seconds
                })

        return jsonify({
            "success": True,
            "message": (
                f"{completed_count} student attendance "
                "record(s) completed and verified."
            ),
            "completedCount": completed_count,
            "attendance": completed_records
        }), 200

    except Exception as e:
        print("\n========== COMPLETE ALL ATTENDANCE ERROR ==========")
        print("Error:", repr(e))
        traceback.print_exc()
        print("===================================================\n")

        return jsonify({
            "success": False,
            "message": "Unable to complete event attendance."
        }), 500



# ==================================
# ADMIN: GET EVENT ATTENDANCE
# ==================================

@events_bp.route("/<event_id>/attendance", methods=["GET"])
@token_required(["admin"])
def get_event_attendance(event_id):
    try:
        if not ObjectId.is_valid(event_id):
            return jsonify({
                "success": False,
                "message": "Invalid event ID."
            }), 400

        event = events_collection.find_one({
            "_id": ObjectId(event_id)
        })

        if not event:
            return jsonify({
                "success": False,
                "message": "Event not found."
            }), 404

        records = list(attendance_collection.find({
            "eventId": event["_id"]
        }).sort("scannedAt", 1))

        for record in records:
            record["_id"] = str(record["_id"])
            record["eventId"] = str(record["eventId"])

            if record.get("registrationId"):
                record["registrationId"] = str(
                    record["registrationId"]
                )

            for field in ["scannedAt", "completedAt"]:
                if isinstance(record.get(field), datetime):
                    record[field] = record[field].isoformat()

        return jsonify({
            "success": True,
            "attendance": records
        }), 200

    except Exception as e:
        print("Get attendance error:", repr(e))
        traceback.print_exc()

        return jsonify({
            "success": False,
            "message": "Unable to fetch attendance."
        }), 500
        
        
        
# ==================================
# STUDENT: GET MY ATTENDANCE TIMERS
# ==================================

@events_bp.route(
    "/student/attendance/timers",
    methods=["GET"]
)
@token_required(["student", "alumni"])
def get_my_attendance_timers():
    try:
        username = g.current_user.get(
            "username", ""
        ).strip().upper()

        if not username:
            return jsonify({
                "success": False,
                "message": "Student username is missing."
            }), 401

        records = list(
            attendance_collection.find({
                "studentUsername": username
            }).sort("scannedAt", -1)
        )

        attendance_list = []

        for record in records:
            scanned_at = record.get("scannedAt")
            completed_at = record.get("completedAt")

            attendance_list.append({
                "_id": str(record["_id"]),
                "eventId": str(record["eventId"]),
                "eventTitle": record.get("eventTitle", ""),
                "eventCode": record.get("eventCode", ""),

                "attendanceStatus": record.get(
                    "attendanceStatus", "Checked In"
                ),

                "adminVerified": record.get(
                    "adminVerified", False
                ),

                "scannedAt": (
                    scanned_at.isoformat()
                    if isinstance(scanned_at, datetime)
                    else scanned_at
                ),

                "completedAt": (
                    completed_at.isoformat()
                    if isinstance(completed_at, datetime)
                    else completed_at
                ),

                "durationSeconds": record.get(
                    "durationSeconds"
                )
            })

        return jsonify({
            "success": True,
            "attendance": attendance_list
        }), 200

    except Exception as e:
        print("\n========== STUDENT ATTENDANCE TIMER ERROR ==========")
        print("Error:", repr(e))
        traceback.print_exc()
        print("====================================================\n")

        return jsonify({
            "success": False,
            "message": "Unable to fetch attendance timers."
        }), 500


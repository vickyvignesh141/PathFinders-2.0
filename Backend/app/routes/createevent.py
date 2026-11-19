import re
import secrets
import hashlib
import json
import traceback
from services.email_service import (
    send_selection_email,
    send_attendance_thankyou_email
)


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
profile_collection = db["studentvolunteers"]  # Assuming student and alumni profiles are stored here

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

        # EVENT TYPE
        event_type = data.get("eventType", "regular")

        if event_type not in ["regular", "physical_verification"]:
            return jsonify({
                "success": False,
                "message": "Invalid event type"
            }), 400

        # EVENT MODE
        event_mode = data.get("eventMode", "offline")

        if event_mode not in ["online", "offline"]:
            return jsonify({
                "success": False,
                "message": "Invalid event mode. Choose online or offline."
            }), 400

        # REQUIRED FIELDS
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

        # EVENT TITLE
        event_title = data["eventTitle"].strip()

        if not re.search(r'[a-zA-Z0-9]', event_title):
            return jsonify({
                "success": False,
                "message": "Event title must contain letters or numbers"
            }), 400

        # TARGET AUDIENCE
        target_audience = data.get("targetAudience", ["students"])

        allowed_audiences = [
            "students",
            "alumni",
            "business_professionals",
            "everyone"
        ]

        if not isinstance(target_audience, list) or not target_audience:
            return jsonify({
                "success": False,
                "message": "Please select at least one target audience"
            }), 400

        if not all(
            audience in allowed_audiences
            for audience in target_audience
        ):
            return jsonify({
                "success": False,
                "message": "Invalid target audience"
            }), 400

        if "everyone" in target_audience and len(target_audience) > 1:
            return jsonify({
                "success": False,
                "message": "Everyone cannot be combined with other audiences"
            }), 400

        # DATE AND TIME
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

        # VOLUNTEERS NEEDED
        volunteers_needed = int(data["volunteersNeeded"])

        if volunteers_needed < 1:
            return jsonify({
                "success": False,
                "message": "At least one volunteer is required"
            }), 400

        # GENERATE EVENT ID
        event_id = generate_event_id(event_title)

        # EVENT DOCUMENT
        event = {
            "eventId": event_id,

            "eventType": event_type,
            "eventMode": event_mode,

            "targetAudience": target_audience,

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

        # SAVE TO MONGODB
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

    student = db.studentvolunteers.find_one({
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

        if event.get("eventType", "regular") != "regular":
            return jsonify({
                "success": False,
                "message": "This completion route is for regular QR events only."
            }), 400

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
        profile_update_failures = []

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
                scanned_at = scanned_at.astimezone(timezone.utc)

            completed_at = datetime.now(timezone.utc)

            duration_seconds = max(
                0,
                int((completed_at - scanned_at).total_seconds())
            )

            # Actual attendance duration
            credited_hours = round(
                duration_seconds / 3600, 2
            )

            # 1 verified hour = 10 points
            credited_points = round(
                (duration_seconds / 3600) * 10, 2
            )

            # Complete attendance only once
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
                        "durationSeconds": duration_seconds,
                        "creditedHours": credited_hours,
                        "creditedPoints": credited_points
                    }
                }
            )

            if result.modified_count != 1:
                continue

            completed_count += 1

            username = str(
                record.get("studentUsername", "")
            ).strip().upper()

            student_name = record.get(
                "studentName", "Student"
            )

            if not username:
                profile_update_failures.append({
                    "username": "",
                    "reason": "Attendance record has no student username"
                })
                continue

            event_entry = {
                "event_id": str(event_object_id),
                "event_name": event.get("eventTitle", ""),
                "hours": credited_hours,
                "points": credited_points
            }

            # Add event and increment totals only if not already recorded
            profile_result = profile_collection.update_one(
                {
                    "username": username,
                    "past_volunteering_details.events_breakdown.event_id": {
                        "$ne": str(event_object_id)
                    }
                },
                {
                    "$push": {
                        "past_volunteering_details.events_breakdown": event_entry
                    },
                    "$inc": {
                        "past_volunteering_details.regular_hours": credited_hours,
                        "past_volunteering_details.total_effective_hours": credited_hours,
                        "past_volunteering_details.total_points": credited_points
                    }
                }
            )

            if profile_result.modified_count == 1:
                print(
                    f"PROFILE UPDATED: {username} | "
                    f"{credited_hours} hours | "
                    f"{credited_points} points"
                )
            else:
                existing_profile = profile_collection.find_one({
                    "username": username
                })

                if not existing_profile:
                    reason = "Student profile not found"
                else:
                    already_added = profile_collection.find_one({
                        "username": username,
                        "past_volunteering_details.events_breakdown.event_id": str(
                            event_object_id
                        )
                    })

                    reason = (
                        "Event already credited in profile"
                        if already_added
                        else "Profile update did not modify the document"
                    )

                print(
                    f"PROFILE NOT UPDATED: {username} | {reason}"
                )

                if reason == "Student profile not found":
                    profile_update_failures.append({
                        "username": username,
                        "reason": reason
                    })

            completed_records.append({
                "_id": str(record["_id"]),
                "studentUsername": username,
                "studentName": student_name,
                "attendanceStatus": "Completed",
                "adminVerified": True,
                "scannedAt": scanned_at.isoformat(),
                "completedAt": completed_at.isoformat(),
                "durationSeconds": duration_seconds,
                "creditedHours": credited_hours,
                "creditedPoints": credited_points
            })

        return jsonify({
            "success": True,
            "message": (
                f"{completed_count} student attendance "
                "record(s) completed and verified."
            ),
            "completedCount": completed_count,
            "profileUpdateFailures": profile_update_failures,
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


# ==================================
# LEADERBOARD: GET REAL VOLUNTEER DATA
# ==================================


# ==========================================
# LEADERBOARD - HISTORICAL + NEW POINTS
# ==========================================

@events_bp.route("/leaderboard", methods=["GET"])
@token_required(["student", "alumni", "admin"])
def get_leaderboard():
    try:
        profiles = list(
            profile_collection.find({
                "role": {"$in": ["student", "alumni"]}
            })
        )

        leaderboard = []

        for profile in profiles:
            username = str(
                profile.get("username", "")
            ).strip().upper()

            if not username:
                continue

            past = profile.get(
                "past_volunteering_details", {}
            ) or {}

            total_points = round(
                float(past.get("total_points", 0) or 0), 2
            )

            total_hours = round(
                float(past.get("total_effective_hours", 0) or 0), 2
            )

            regular_hours = round(
                float(past.get("regular_hours", 0) or 0), 2
            )

            pv_hours = round(
                float(past.get("physical_verification_hours", 0) or 0), 2
            )

            pv_count = int(
                past.get("physical_verification_count", 0) or 0
            )

            past_events = past.get("events_breakdown", []) or []

            leaderboard.append({
                "username": username,
                "name": profile.get("name", "Unknown"),

                "rollNo": username,
                "college": profile.get("college", ""),
                "department": profile.get("department", ""),
                "zone": profile.get("zone", ""),
                "batch": profile.get("batch", ""),
                "course": profile.get("course", ""),

                # All points are now stored in the profile
                "pastPoints": total_points,
                "newPoints": 0,
                "points": total_points,
                "xp": total_points,

                "pastHours": total_hours,
                "newVerifiedHours": 0,
                "verifiedHours": total_hours,
                "regularHours": regular_hours,

                "physicalVerificationCount": pv_count,
                "physicalVerificationHours": pv_hours,

                "eventsAttended": len(past_events),
                "pastVolunteeringEvents": past_events
            })

        leaderboard.sort(
            key=lambda student: student["points"],
            reverse=True
        )

        for index, student in enumerate(leaderboard):
            student["rank"] = index + 1

        return jsonify({
            "success": True,
            "totalVolunteers": len(leaderboard),
            "leaderboard": leaderboard
        }), 200

    except Exception as e:
        print("LEADERBOARD ERROR:", repr(e))
        traceback.print_exc()

        return jsonify({
            "success": False,
            "message": "Unable to fetch leaderboard"
        }), 500

from bson import ObjectId
from datetime import datetime

@events_bp.route("/<event_id>/confirm-selection", methods=["POST"])
@token_required(["admin"])
def confirm_event_selection(event_id):
    try:
        data = request.get_json() or {}
        selected_ids = data.get("selectedRegistrationIds", [])

        if not ObjectId.is_valid(event_id):
            return jsonify({
                "success": False,
                "message": "Invalid event ID"
            }), 400

        if not isinstance(selected_ids, list) or not selected_ids:
            return jsonify({
                "success": False,
                "message": "Select at least one student"
            }), 400

        if not all(ObjectId.is_valid(str(x)) for x in selected_ids):
            return jsonify({
                "success": False,
                "message": "Invalid registration ID"
            }), 400

        event_oid = ObjectId(event_id)
        registration_oids = list({
            ObjectId(str(x)) for x in selected_ids
        })

        event = events_collection.find_one({"_id": event_oid})

        if not event:
            return jsonify({
                "success": False,
                "message": "Event not found"
            }), 404

        # Fetch only registrations belonging to this event
        registrations = list(registrations_collection.find({
            "_id": {"$in": registration_oids},
            "eventId": event_oid
        }))

        if len(registrations) != len(registration_oids):
            return jsonify({
                "success": False,
                "message": "One or more selected students do not belong to this event"
            }), 400

        approved_count = 0
        emails_sent = 0
        emails_failed = 0
        emails_skipped = 0

        for registration in registrations:

            registration_id = registration["_id"]

            # Approve selected student
            registrations_collection.update_one(
                {"_id": registration_id},
                {
                    "$set": {
                        "status": "Approved",
                        "updatedAt": datetime.utcnow()
                    }
                }
            )

            approved_count += 1

            # Claim notification so repeated clicks don't resend sent emails
            claim = registrations_collection.update_one(
                {
                    "_id": registration_id,
                    "$or": [
                        {"emailNotification.status": {"$exists": False}},
                        {"emailNotification.status": "pending"},
                        {"emailNotification.status": "failed"}
                    ]
                },
                {
                    "$set": {
                        "emailNotification.status": "sending",
                        "emailNotification.updatedAt": datetime.utcnow()
                    }
                }
            )

            if claim.modified_count == 0:
                emails_skipped += 1
                continue

            student_email = registration.get("email")
            student_name = registration.get("studentName", "Student")

            if not student_email:
                registrations_collection.update_one(
                    {"_id": registration_id},
                    {"$set": {
                        "emailNotification.status": "failed",
                        "emailNotification.error": "Student email not found"
                    }}
                )
                emails_failed += 1
                continue

            email_result = send_selection_email(
                student_email,
                student_name,
                event
            )

            if email_result:
                registrations_collection.update_one(
                    {"_id": registration_id},
                    {"$set": {
                        "emailNotification.status": "sent",
                        "emailNotification.sentAt": datetime.utcnow()
                    },
                    "$unset": {
                        "emailNotification.error": ""
                    }}
                )
                emails_sent += 1
            else:
                registrations_collection.update_one(
                    {"_id": registration_id},
                    {"$set": {
                        "emailNotification.status": "failed",
                        "emailNotification.error": "SMTP sending failed"
                    }}
                )
                emails_failed += 1

        return jsonify({
            "success": True,
            "message": "Student selection processed",
            "approvedCount": approved_count,
            "emailsSent": emails_sent,
            "emailsFailed": emails_failed,
            "emailsSkipped": emails_skipped
        }), 200

    except Exception as e:
        print("Confirm selection error:", str(e))
        return jsonify({
            "success": False,
            "message": "Failed to confirm selection"
        }), 500
        
        # Record when the admin sent the approval list
approval_sent_at = datetime.now(timezone.utc)


        
# ==================================
# ADMIN: GET EVENT HISTORY
# ==================================

@events_bp.route("/admin/history", methods=["GET"])
@token_required(["admin"])
def get_admin_event_history():
    try:
        now = datetime.now(timezone.utc)

        all_events = list(
            events_collection.find().sort("date", -1)
        )

        history = []

        for event in all_events:
            event_id = event["_id"]
            end_at = event.get("endAt")

            # Treat MongoDB naive datetimes as UTC
            if isinstance(end_at, datetime):
                if end_at.tzinfo is None:
                    end_at = end_at.replace(tzinfo=timezone.utc)
                else:
                    end_at = end_at.astimezone(timezone.utc)

            # Fallback for older events without endAt
            if not end_at and event.get("date") and event.get("endTime"):
                try:
                    local_end = datetime.strptime(
                        f"{event['date']} {event['endTime']}",
                        "%Y-%m-%d %H:%M"
                    )
                    end_at = (
                        local_end - timedelta(hours=5, minutes=30)
                    ).replace(tzinfo=timezone.utc)
                except ValueError:
                    end_at = None

            is_completed = (
                str(event.get("status", "")).lower() == "completed"
            )
            is_past = bool(end_at and end_at <= now)

            if not (is_completed or is_past):
                continue

            registrations = list(
                registrations_collection.find({
                    "eventId": event_id
                }).sort("registeredAt", -1)
            )

            attendance_records = list(
                attendance_collection.find({
                    "eventId": event_id
                }).sort("scannedAt", 1)
            )

            attendance_by_username = {
                str(record.get("studentUsername", "")).upper(): record
                for record in attendance_records
            }

            registration_list = []

            for registration in registrations:
                username = str(
                    registration.get("studentUsername", "")
                ).upper()

                attendance = attendance_by_username.get(username)

                duration_seconds = (
                    attendance.get("durationSeconds", 0)
                    if attendance else 0
                )

                registered_at = registration.get("registeredAt")
                scanned_at = attendance.get("scannedAt") if attendance else None
                completed_at = attendance.get("completedAt") if attendance else None

                registration_list.append({
                    "registrationId": str(registration["_id"]),
                    "studentName": registration.get("studentName", ""),
                    "studentUsername": registration.get("studentUsername", ""),
                    "email": registration.get("email", ""),
                    "phone": registration.get("phone", ""),
                    "college": registration.get("college", ""),
                    "status": registration.get("status", "Registered"),
                    "registeredAt": (
                        registered_at.isoformat()
                        if isinstance(registered_at, datetime)
                        else registered_at
                    ),
                    "attendance": {
                        "status": (
                            attendance.get("attendanceStatus", "Not Checked In")
                            if attendance else "Not Checked In"
                        ),
                        "adminVerified": (
                            attendance.get("adminVerified", False)
                            if attendance else False
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
                        "durationSeconds": duration_seconds,
                        "creditedHours": round(
                            duration_seconds / 3600, 2
                        )
                    } if event.get("eventType", "regular") == "regular" else None
                })

            verified_attendance = [
                record for record in attendance_records
                if record.get("attendanceStatus") == "Completed"
                and record.get("adminVerified") is True
            ]

            total_verified_hours = round(
                sum(
                    record.get("durationSeconds", 0)
                    for record in verified_attendance
                ) / 3600,
                2
            )

            history.append({
                "id": str(event_id),
                "eventId": event.get("eventId", ""),
                "title": event.get("eventTitle", ""),
                "description": event.get("eventDescription", ""),
                "venue": event.get("location", ""),
                "date": event.get("date", ""),
                "startTime": event.get("startTime", ""),
                "endTime": event.get("endTime", ""),
                "zone": event.get("zone", ""),
                "eventType": event.get("eventType", "regular"),
                "status": "Completed" if is_completed else "Past",
                "volunteersNeeded": event.get("volunteersNeeded", 0),
                "totalRegistrations": len(registrations),
                "selectedCount": sum(
                    1 for item in registrations
                    if item.get("status") == "Approved"
                ),
                "attendanceCount": len(attendance_records),
                "verifiedAttendanceCount": len(verified_attendance),
                "totalVerifiedHours": total_verified_hours,
                "registrations": registration_list
            })

        return jsonify({
            "success": True,
            "totalEvents": len(history),
            "history": history
        }), 200

    except Exception as e:
        print("Admin Event History Error:", repr(e))
        traceback.print_exc()

        return jsonify({
            "success": False,
            "message": "Unable to fetch event history"
        }), 500

@events_bp.route("/admin/student-status", methods=["GET"])
@token_required(["admin"])
def admin_student_status():
    try:
        from datetime import datetime, timezone

        # -----------------------------------------
        # 1. Fetch students
        # -----------------------------------------
        students = list(
            profile_collection.find(
                {"role": {"$in": ["student", "alumni"]}},
                {"password": 0}
            )
        )

        # -----------------------------------------
        # 2. Fetch events whose approval lists
        #    have been sent
        # -----------------------------------------
        eligible_events = list(
            events_collection.find({
                "approvalListSentAt": {
                    "$exists": True,
                    "$ne": None
                }
            })
        )

        eligible_event_ids = {
            str(event["_id"]) for event in eligible_events
        }

        # -----------------------------------------
        # 3. Fetch registrations once
        # -----------------------------------------
        all_registrations = list(
            registrations_collection.find(
                {},
                {
                    "studentUsername": 1,
                    "eventId": 1
                }
            )
        )

        registered_pairs = {
            (
                str(registration.get("studentUsername", "")),
                str(registration.get("eventId", ""))
            )
            for registration in all_registrations
        }

        # -----------------------------------------
        # 4. Fetch verified attendance once
        # -----------------------------------------
        all_attendance = list(
            attendance_collection.find({
                "adminVerified": True
            })
        )

        attendance_by_student = {}

        for attendance in all_attendance:
            username = attendance.get("studentUsername")

            if not username:
                continue

            activity_date = (
                attendance.get("completedAt")
                or attendance.get("scannedAt")
                or attendance.get("createdAt")
            )

            if not activity_date:
                continue

            attendance_by_student.setdefault(
                username, []
            ).append(activity_date)

        # -----------------------------------------
        # 5. Helper: convert date to ISO string
        # -----------------------------------------
        def serialize_date(value):
            if not value:
                return None

            if isinstance(value, datetime):
                return value.isoformat()

            return str(value)

        def calculate_days_ago(value):
            if not value:
                return None

            try:
                if isinstance(value, str):
                    value = datetime.fromisoformat(
                        value.replace("Z", "+00:00")
                    )

                if not isinstance(value, datetime):
                    return None

                if value.tzinfo is None:
                    value = value.replace(tzinfo=timezone.utc)

                now = datetime.now(timezone.utc)
                difference = now - value.astimezone(timezone.utc)

                return max(0, difference.days)

            except (ValueError, TypeError):
                return None

        # -----------------------------------------
        # 6. Build student response
        # -----------------------------------------
        result = []

        for student in students:
            username = student.get("username", "")

            # Count missed approval-list opportunities
            missed_opportunities = 0

            for event_id in eligible_event_ids:
                if (username, event_id) not in registered_pairs:
                    missed_opportunities += 1

            status = (
                "Inactive"
                if missed_opportunities > 3
                else "Active"
            )

            volunteering = (
                student.get("past_volunteering_details") or {}
            )

            events_breakdown = (
                volunteering.get("events_breakdown") or []
            )

            # Find latest verified attendance date
            activity_dates = attendance_by_student.get(
                username, []
            )

            last_activity = (
                max(activity_dates)
                if activity_dates
                else None
            )

            last_active_days = calculate_days_ago(
                last_activity
            )

            # Format zone
            zone_value = student.get("zone")

            zone = (
                f"Zone {zone_value}"
                if zone_value is not None
                else "-"
            )

            # Build actual student data
            result.append({
                "id": str(student.get("_id", "")),
                "name": student.get("name", "Unknown"),
                "rollNo": username,
                "email": student.get("email", ""),
                "phone": student.get("mobile_number", ""),
                "college": student.get("college", ""),
                "zone": zone,
                "batch": student.get("batch", ""),
                "department": student.get("department", ""),
                "status": status,

                "eventsAttended": len(events_breakdown),

                "hours": volunteering.get(
                    "total_effective_hours", 0
                ),

                "points": volunteering.get(
                    "total_points", 0
                ),

                "regularHours": volunteering.get(
                    "regular_hours", 0
                ),

                "physicalVerificationHours": volunteering.get(
                    "physical_verification_hours", 0
                ),

                "physicalVerificationCount": volunteering.get(
                    "physical_verification_count", 0
                ),

                "skills": student.get("skills", []),

                "eventsBreakdown": events_breakdown,

                "lastActiveDays": last_active_days,

                "lastActivityDate": serialize_date(
                    last_activity
                ),

                "joinedOn": serialize_date(
                    student.get("joinedAt")
                    or student.get("createdAt")
                ),

                "missedOpportunities": missed_opportunities,

                "accommodation": student.get(
                    "accommodation_type", ""
                )
            })

        # -----------------------------------------
        # 7. Sort by student name
        # -----------------------------------------
        result.sort(
            key=lambda item: item["name"].lower()
        )

        active_count = sum(
            1 for student in result
            if student["status"] == "Active"
        )

        inactive_count = sum(
            1 for student in result
            if student["status"] == "Inactive"
        )

        return jsonify({
            "success": True,
            "students": result,
            "totalStudents": len(result),
            "activeCount": active_count,
            "inactiveCount": inactive_count
        }), 200

    except Exception as e:
        print("STUDENT STATUS ERROR:", str(e))
        traceback.print_exc()

        return jsonify({
            "success": False,
            "message": "Unable to fetch student status"
        }), 500
        
        
        
@events_bp.route("/<event_id>/attendance/close", methods=["PATCH"])
@token_required(["admin"])
def close_event_attendance(event_id):
    try:
        # 1. Validate event ID
        try:
            event_object_id = ObjectId(event_id)
        except Exception:
            return jsonify({"message": "Invalid event ID"}), 400

        # 2. Find event
        event = events_collection.find_one({"_id": event_object_id})

        if not event:
            return jsonify({"message": "Event not found"}), 404

        # 3. Ensure attendance completion was performed first
        pending_count = attendance_collection.count_documents({
            "eventId": event_object_id,
            "attendanceStatus": "Checked In"
        })

        if pending_count > 0:
            return jsonify({
                "message": (
                    "Complete attendance for all students before closing it."
                ),
                "pendingCount": pending_count
            }), 400

        # 4. Only completed and admin-verified students are eligible
        attendance_records = list(attendance_collection.find({
            "eventId": event_object_id,
            "attendanceStatus": "Completed",
            "adminVerified": True
        }))

        sent_count = 0
        failed_count = 0
        skipped_count = 0

        # 5. Send thank-you email to each eligible student
        for record in attendance_records:

            # Skip if email was already sent
            email_status = record.get("thankYouEmail", {}).get("status")

            if email_status == "sent":
                skipped_count += 1
                continue

            # Claim this email so concurrent requests don't send duplicates
            claim = attendance_collection.update_one(
                {
                    "_id": record["_id"],
                    "attendanceStatus": "Completed",
                    "adminVerified": True,
                    "$or": [
                        {"thankYouEmail.status": {"$exists": False}},
                        {"thankYouEmail.status": "pending"},
                        {"thankYouEmail.status": "failed"}
                    ]
                },
                {
                    "$set": {
                        "thankYouEmail.status": "sending",
                        "thankYouEmail.startedAt": datetime.now(timezone.utc)
                    }
                }
            )

            if claim.modified_count == 0:
                skipped_count += 1
                continue

            # 6. Find student's registration
            registration_id = record.get("registrationId")

            if registration_id:
                registration = registrations_collection.find_one({
                    "_id": registration_id
                })
            else:
                registration = registrations_collection.find_one({
                    "eventId": event_object_id,
                    "studentUsername": record.get("studentUsername")
                })

            if not registration or not registration.get("email"):
                attendance_collection.update_one(
                    {"_id": record["_id"]},
                    {
                        "$set": {
                            "thankYouEmail.status": "failed",
                            "thankYouEmail.error": "Student email not found",
                            "thankYouEmail.failedAt": datetime.now(timezone.utc)
                        }
                    }
                )
                failed_count += 1
                continue

            # 7. Get earned points and verified hours
            earned_points = record.get("creditedPoints")
            credited_hours = record.get("creditedHours")

            if earned_points is None or credited_hours is None:
                attendance_collection.update_one(
                    {"_id": record["_id"]},
                    {
                        "$set": {
                            "thankYouEmail.status": "failed",
                            "thankYouEmail.error": "Verified points or hours not found",
                            "thankYouEmail.failedAt": datetime.now(timezone.utc)
                        }
                    }
                )
                failed_count += 1
                continue

            # 8. Send email
            email_sent = send_attendance_thankyou_email(
                student_email=registration["email"],
                student_name=(
                    registration.get("studentName")
                    or record.get("studentName")
                    or "Student"
                ),
                event=event,
                earned_points=earned_points,
                credited_hours=credited_hours
            )

            if email_sent:
                attendance_collection.update_one(
                    {"_id": record["_id"]},
                    {
                        "$set": {
                            "thankYouEmail.status": "sent",
                            "thankYouEmail.sentAt": datetime.now(timezone.utc)
                        },
                        "$unset": {
                            "thankYouEmail.error": ""
                        }
                    }
                )
                sent_count += 1
            else:
                attendance_collection.update_one(
                    {"_id": record["_id"]},
                    {
                        "$set": {
                            "thankYouEmail.status": "failed",
                            "thankYouEmail.error": "Email sending failed",
                            "thankYouEmail.failedAt": datetime.now(timezone.utc)
                        }
                    }
                )
                failed_count += 1

        # 9. Mark attendance as closed
        events_collection.update_one(
            {"_id": event_object_id},
            {
                "$set": {
                    "attendanceClosed": True,
                    "attendanceClosedAt": datetime.now(timezone.utc)
                }
            }
        )

        return jsonify({
            "message": "Attendance closing process completed",
            "totalEligibleStudents": len(attendance_records),
            "emailsSent": sent_count,
            "emailsFailed": failed_count,
            "emailsSkipped": skipped_count
        }), 200

    except Exception as e:
        print("Close attendance error:", str(e))
        return jsonify({
            "message": "Failed to close attendance",
            "error": str(e)
        }), 500

import secrets
from datetime import datetime, timezone

from flask import Blueprint, request, jsonify, g
from bson import ObjectId
from pymongo.errors import DuplicateKeyError

from app.db import db
from app.auth_utils import token_required


feedback_bp = Blueprint("feedback", __name__)

# ==================================================
# MONGODB COLLECTIONS
# ==================================================

feedback_collection = db["feedback"]
attendance_collection = db["attendance"]
events_collection = db["events"]


# One feedback per student per event
feedback_collection.create_index(
    [("eventId", 1), ("studentUsername", 1)],
    unique=True
)


# ==================================================
# POST: STUDENT SUBMIT FEEDBACK
# ==================================================

@feedback_bp.route("/submit", methods=["POST"])
@token_required(["student", "alumni"])
def submit_feedback():

    try:
        username = g.current_user.get(
            "username", ""
        ).strip().upper()

        data = request.get_json(silent=True) or {}

        event_id = data.get("eventId")

        # Validate event ID
        if not event_id or not ObjectId.is_valid(str(event_id)):
            return jsonify({
                "success": False,
                "message": "Valid event ID is required"
            }), 400

        event_object_id = ObjectId(str(event_id))

        # Check event exists
        event = events_collection.find_one({
            "_id": event_object_id
        })

        if not event:
            return jsonify({
                "success": False,
                "message": "Event not found"
            }), 404

        # Check admin verified attendance
        attendance = attendance_collection.find_one({
            "eventId": event_object_id,
            "studentUsername": username,
            "attendanceStatus": "Completed",
            "adminVerified": True
        })

        if not attendance:
            return jsonify({
                "success": False,
                "message": (
                    "You must complete an event with "
                    "admin-verified attendance before "
                    "submitting feedback."
                )
            }), 403

        # Validate ratings
        ratings = data.get("ratings", {})

        rating_categories = [
            "Overall Experience",
            "Event Management",
            "Volunteer Coordination"
        ]

        for category in rating_categories:
            rating = ratings.get(category)

            if (
                not isinstance(rating, int)
                or isinstance(rating, bool)
                or rating < 1
                or rating > 5
            ):
                return jsonify({
                    "success": False,
                    "message": f"Please provide a valid rating for {category}"
                }), 400

        # Validate overall experience
        overall_experience = str(
            data.get("overallExperience", "")
        ).strip()

        if not overall_experience:
            return jsonify({
                "success": False,
                "message": "Overall experience is required"
            }), 400

        # Student name
        student_name = (
            attendance.get("studentName")
            or username
        )

        # Generate certificate ID after feedback submission
        certificate_id = (
            f"MTF-{datetime.now(timezone.utc).year}-"
            f"{secrets.token_hex(4).upper()}"
        )

        submitted_at = datetime.now(timezone.utc)

        # Calculate average rating
        average_rating = round(
            sum(
                ratings[category]
                for category in rating_categories
            ) / len(rating_categories),
            1
        )

        # Feedback document
        feedback_document = {
            "eventId": event_object_id,
            "eventName": event.get(
                "eventTitle",
                "Volunteer Event"
            ),
            "studentUsername": username,
            "studentName": student_name,
            "ratings": ratings,
            "answers": data.get("answers", {}),
            "overallExperience": overall_experience,
            "likedMost": data.get("likedMost", ""),
            "learning": data.get("learning", ""),
            "averageRating": average_rating,
            "feedbackSubmitted": True,
            "submittedAt": submitted_at,
            "certificateId": certificate_id,
            "certificateGenerated": True
        }

        result = feedback_collection.insert_one(
            feedback_document
        )

        return jsonify({
            "success": True,
            "message": (
                "Feedback submitted successfully. "
                "Certificate is ready."
            ),
            "feedbackId": str(result.inserted_id),
            "certificate": {
                "certificateId": certificate_id,
                "certificateGenerated": True,
                "eventId": str(event_object_id),
                "eventName": event.get(
                    "eventTitle",
                    "Volunteer Event"
                ),
                "studentName": student_name,
                "date": event.get("date", ""),
                "organization": "Maatram Foundation"
            }
        }), 201

    except DuplicateKeyError:
        return jsonify({
            "success": False,
            "message": (
                "You have already submitted "
                "feedback for this event."
            )
        }), 409

    except Exception as e:
        print("Feedback submission error:", str(e))

        return jsonify({
            "success": False,
            "message": "Unable to submit feedback"
        }), 500


# ==================================================
# GET: ADMIN - ALL STUDENT FEEDBACK
# ==================================================

@feedback_bp.route("/admin/all", methods=["GET"])
@token_required(["admin"])
def get_all_feedback():

    try:
        records = list(
            feedback_collection.find({
                "feedbackSubmitted": True
            }).sort("submittedAt", -1)
        )

        feedback_list = []

        for record in records:

            feedback_list.append({
                "id": str(record["_id"]),

                "eventId": str(
                    record.get("eventId", "")
                ),

                "eventName": record.get(
                    "eventName",
                    "Volunteer Event"
                ),

                "studentUsername": record.get(
                    "studentUsername",
                    ""
                ),

                "studentName": record.get(
                    "studentName",
                    "Student"
                ),

                "ratings": record.get(
                    "ratings",
                    {}
                ),

                "answers": record.get(
                    "answers",
                    {}
                ),

                "overallExperience": record.get(
                    "overallExperience",
                    ""
                ),

                "likedMost": record.get(
                    "likedMost",
                    ""
                ),

                "learning": record.get(
                    "learning",
                    ""
                ),

                "averageRating": record.get(
                    "averageRating",
                    0
                ),

                "feedbackSubmitted": record.get(
                    "feedbackSubmitted",
                    False
                ),

                "submittedAt": (
                    record["submittedAt"].isoformat()
                    if record.get("submittedAt")
                    else None
                ),

                "certificateId": record.get(
                    "certificateId",
                    ""
                )
            })

        return jsonify({
            "success": True,
            "count": len(feedback_list),
            "feedback": feedback_list
        }), 200

    except Exception as e:
        print("Admin feedback fetch error:", str(e))

        return jsonify({
            "success": False,
            "message": "Unable to fetch feedback"
        }), 500


# ==================================================
# GET: STUDENT CERTIFICATES
# ALL ADMIN-VERIFIED COMPLETED EVENTS
# ==================================================

@feedback_bp.route("/student/certificates", methods=["GET"])
@token_required(["student", "alumni"])
def get_student_certificates():

    try:
        username = g.current_user.get(
            "username", ""
        ).strip().upper()

        # Get all admin-verified completed attendance
        attendance_records = list(
            attendance_collection.find({
                "studentUsername": username,
                "attendanceStatus": "Completed",
                "adminVerified": True
            })
        )

        certificates = []
        processed_events = set()

        for attendance in attendance_records:

            raw_event_id = attendance.get("eventId")

            if not raw_event_id:
                continue

            # Convert event ID to ObjectId
            try:
                event_id = (
                    raw_event_id
                    if isinstance(raw_event_id, ObjectId)
                    else ObjectId(str(raw_event_id))
                )
            except Exception:
                continue

            event_id_string = str(event_id)

            # Avoid duplicate event cards
            if event_id_string in processed_events:
                continue

            processed_events.add(event_id_string)

            # Get event details
            event = events_collection.find_one({
                "_id": event_id
            })

            if not event:
                continue

            # Check feedback submission
            feedback_record = feedback_collection.find_one({
                "eventId": event_id,
                "studentUsername": username,
                "feedbackSubmitted": True,
                "certificateGenerated": True
            })

            feedback_submitted = (
                feedback_record is not None
            )

            # Calculate volunteering hours
            duration_seconds = attendance.get(
                "durationSeconds", 0
            ) or 0

            try:
                attendance_hours = round(
                    float(duration_seconds) / 3600,
                    2
                )
            except (TypeError, ValueError):
                attendance_hours = 0

            # Student name
            student_name = (
                attendance.get("studentName")
                or (
                    feedback_record.get("studentName")
                    if feedback_record
                    else username
                )
            )

            # Certificate response
            certificates.append({

                "id": (
                    str(feedback_record["_id"])
                    if feedback_record
                    else event_id_string
                ),

                "eventId": event_id_string,

                "title": event.get(
                    "eventTitle",
                    "Volunteer Event"
                ),

                "organization": "Maatram Foundation",

                "category": event.get(
                    "volunteerWork",
                    "Volunteering"
                ),

                "date": event.get(
                    "date",
                    ""
                ),

                "hours": (
                    f"{attendance_hours} Hours"
                    if attendance_hours > 0
                    else "Not available"
                ),

                # Certificate ID only after feedback
                "certificateId": (
                    feedback_record.get(
                        "certificateId",
                        ""
                    )
                    if feedback_record
                    else ""
                ),

                "feedbackSubmitted": feedback_submitted,

                "status": (
                    "Available"
                    if feedback_submitted
                    else "Feedback Required"
                ),

                "studentName": student_name,

                "submittedAt": (
                    feedback_record["submittedAt"].isoformat()
                    if (
                        feedback_record
                        and feedback_record.get("submittedAt")
                    )
                    else None
                )
            })

        return jsonify({
            "success": True,
            "count": len(certificates),
            "certificates": certificates
        }), 200

    except Exception as e:
        print("Get certificates error:", str(e))

        return jsonify({
            "success": False,
            "message": "Unable to fetch certificates"
        }), 500

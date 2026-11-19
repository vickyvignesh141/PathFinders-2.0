
from flask import Blueprint, jsonify
from bson import ObjectId
from pymongo import DESCENDING

from app.db import db
from app.auth_utils import token_required

# Existing RAG recommendation algorithm
from services.rag.event_recommender import recommend_volunteers


# ============================================================
# BLUEPRINT
# ============================================================

rag_bp = Blueprint("rag", __name__)


# ============================================================
# MONGODB COLLECTIONS
# ============================================================

events_collection = db["events"]
registrations_collection = db["registrations"]
profiles_collection = db["studentvolunteers"]


# ============================================================
# ADMIN: GET REGISTERED STUDENTS FOR RAG
# ============================================================

@rag_bp.route("/<event_id>/candidates", methods=["GET"])
@token_required(["admin"])
def get_rag_candidates(event_id):

    try:
        if not ObjectId.is_valid(event_id):
            return jsonify({
                "success": False,
                "message": "Invalid event ID"
            }), 400

        event_object_id = ObjectId(event_id)

        # Fetch selected event
        event = events_collection.find_one({
            "_id": event_object_id
        })

        if not event:
            return jsonify({
                "success": False,
                "message": "Event not found"
            }), 404

        # Only Registered students
        registrations = list(
            registrations_collection.find({
                "eventId": event_object_id,
                "status": "Registered"
            }).sort("registeredAt", DESCENDING)
        )

        usernames = list({
            str(registration.get("studentUsername", ""))
            .strip().upper()
            for registration in registrations
            if registration.get("studentUsername")
        })

        profiles = list(
            profiles_collection.find({
                "username": {"$in": usernames},
                "role": {"$in": ["student", "alumni"]}
            })
        )

        profile_map = {
            str(profile.get("username", "")).strip().upper(): profile
            for profile in profiles
        }

        candidates = []
        missing_profiles = []

        for registration in registrations:

            username = str(
                registration.get("studentUsername", "")
            ).strip().upper()

            profile = profile_map.get(username)

            if not profile:
                missing_profiles.append(username)
                continue

            registered_at = registration.get("registeredAt")

            candidates.append({
                "registrationId": str(registration["_id"]),
                "username": username,
                "name": profile.get("name", ""),

                "registeredAt": (
                    registered_at.isoformat()
                    if hasattr(registered_at, "isoformat")
                    else registered_at
                ),

                "registrationAddress": registration.get(
                    "address", ""
                ),

                "residenceType": registration.get(
                    "residenceType", ""
                ),

                "collegeLocation": profile.get(
                    "collegeLocation", ""
                ),

                "accommodationType": profile.get(
                    "accommodation_type",
                    profile.get("residenceType", "")
                ),

                "pastVolunteeringDetails": profile.get(
                    "past_volunteering_details", {}
                )
            })

        return jsonify({
            "success": True,

            "event": {
                "id": str(event["_id"]),
                "title": event.get("eventTitle", ""),
                "description": event.get("eventDescription", ""),
                "volunteerWork": event.get("volunteerWork", ""),
                "location": event.get("location", ""),
                "date": event.get("date", ""),
                "volunteersNeeded": event.get(
                    "volunteersNeeded", 0
                )
            },

            "totalRegistrations": len(registrations),
            "eligibleCandidates": len(candidates),
            "missingProfiles": missing_profiles,
            "candidates": candidates

        }), 200

    except Exception as error:

        print(
            "RAG Candidate Fetch Error:",
            repr(error)
        )

        return jsonify({
            "success": False,
            "message": "Unable to fetch RAG candidates"
        }), 500


# ============================================================
# ADMIN: GENERATE VOLUNTEER RECOMMENDATIONS
# ============================================================

@rag_bp.route(
    "/<event_id>/recommendations",
    methods=["GET"]
)
@token_required(["admin"])
def generate_event_recommendations(event_id):

    try:

        # Validate event ID before running RAG
        if not ObjectId.is_valid(event_id):
            return jsonify({
                "success": False,
                "message": "Invalid event ID"
            }), 400

        # Call your existing recommendation algorithm
        result, status_code = recommend_volunteers(
            event_id,
            db
        )

        return jsonify(result), status_code

    except Exception as error:

        print(
            "RAG Recommendation API Error:",
            repr(error)
        )

        return jsonify({
            "success": False,
            "message": "Unable to generate volunteer recommendations"
        }), 500

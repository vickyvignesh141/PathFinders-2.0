
# ============================================================
# MAATRAM - RAG EVENT VOLUNTEER RECOMMENDER
# ============================================================
# Responsibilities:
# 1. Fetch Registered students for the selected event.
# 2. Match each registration with the student profile.
# 3. Calculate student-to-event distance.
# 4. Expand the search radius when necessary.
# 5. Classify students into High, Medium and Low.
# 6. Use RAG to calculate volunteering-history relevance.
# 7. Rank candidates using RAG relevance and FCFS.
# 8. Select volunteers using 20/30/50 allocation.
# ============================================================

import re
from datetime import datetime, timezone

import os
from dotenv import load_dotenv
from groq import Groq

from bson import ObjectId
from geopy.distance import geodesic
from geopy.geocoders import Nominatim
from geopy.extra.rate_limiter import RateLimiter

from langchain_core.documents import Document
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings


# ============================================================
# CONFIGURATION
# ============================================================

INITIAL_RADIUS_KM = 20
RADIUS_INCREMENT_KM = 5

HIGH_PERCENTAGE = 0.20
MEDIUM_PERCENTAGE = 0.30
LOW_PERCENTAGE = 0.50

EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

# ============================================================
# GROQ LLM CONFIGURATION
# ============================================================

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = "openai/gpt-oss-20b"

groq_client = (
    Groq(api_key=GROQ_API_KEY)
    if GROQ_API_KEY
    else None
)


# ============================================================
# GEOCODING SETUP
# ============================================================

geolocator = Nominatim(
    user_agent="maatram_volunteer_recommendation"
)

geocode_location = RateLimiter(
    geolocator.geocode,
    min_delay_seconds=1
)

# Keep already calculated locations in memory.
location_cache = {}


def get_coordinates(location):
    """
    Convert a location name/address into latitude and longitude.

    Previously calculated locations are reused from cache.
    """

    if not location:
        return None

    location = str(location).strip()

    if not location:
        return None

    if location in location_cache:
        return location_cache[location]

    try:
        result = geocode_location(location)

        if not result:
            location_cache[location] = None
            return None

        coordinates = (
            result.latitude,
            result.longitude
        )

        location_cache[location] = coordinates

        return coordinates

    except Exception as error:
        print(
            f"GEOCODING ERROR: {location} | {error}"
        )

        location_cache[location] = None
        return None


# ============================================================
# DATE HANDLING
# ============================================================

def parse_datetime(value):
    """
    Convert MongoDB datetime values into timezone-aware UTC values.
    """

    if isinstance(value, dict):
        value = value.get("$date", value)

    if isinstance(value, datetime):
        result = value

    elif isinstance(value, str):
        try:
            result = datetime.fromisoformat(
                value.replace("Z", "+00:00")
            )
        except ValueError:
            return None

    else:
        return None

    if result.tzinfo is None:
        result = result.replace(tzinfo=timezone.utc)

    return result.astimezone(timezone.utc)


# ============================================================
# EVENT PARTICIPATION COUNT
# ============================================================

def get_event_participation_count(profile, event):
    """
    Count how many times the student participated in this
    exact event.

    Event ID is checked first.
    Event title is used as a fallback for historical records.
    """

    past_details = profile.get(
        "past_volunteering_details", {}
    ) or {}

    event_breakdown = past_details.get(
        "events_breakdown", []
    ) or []

    event_id = str(event.get("_id"))
    event_title = str(
        event.get("eventTitle", "")
    ).strip().lower()

    participation_count = 0

    for previous_event in event_breakdown:

        previous_id = str(
            previous_event.get("event_id", "")
        )

        previous_title = str(
            previous_event.get("event_name", "")
        ).strip().lower()

        if previous_id == event_id:
            participation_count += 1

        elif previous_title == event_title:
            participation_count += 1

    return participation_count


# ============================================================
# STUDENT VOLUNTEERING HISTORY
# ============================================================

def get_volunteering_history(profile):
    """
    Extract volunteering history for RAG.

    Password, email, phone and other unnecessary personal
    information are not included.
    """

    past_details = profile.get(
        "past_volunteering_details", {}
    ) or {}

    events = past_details.get(
        "events_breakdown", []
    ) or []

    history = []

    for item in events:

        event_name = item.get(
            "event_name", "Unknown event"
        )

        hours = item.get("hours", 0) or 0
        points = item.get("points", 0) or 0

        history.append(
            f"Event: {event_name}, "
            f"Hours: {hours}, "
            f"Points: {points}"
        )

    if not history:
        return "No previous volunteering history."

    return "\n".join(history)


# ============================================================
# BUILD RAG DOCUMENTS
# ============================================================

def build_rag_documents(candidates):
    """
    Create one RAG document for every eligible student.

    Each document contains that student's previous volunteering
    activities and their hours and points.
    """

    documents = []

    for candidate in candidates:

        history = get_volunteering_history(
            candidate["profile"]
        )

        document_text = (
            f"Student username: {candidate['username']}\n"
            f"Previous volunteering history:\n"
            f"{history}"
        )

        documents.append(
            Document(
                page_content=document_text,
                metadata={
                    "username": candidate["username"]
                }
            )
        )

    return documents


# ============================================================
# RAG RELEVANCE CALCULATION
# ============================================================

def calculate_rag_relevance(
    candidates,
    selected_event
):
    """
    Build a temporary ChromaDB vector store and calculate
    each student's semantic relevance to the selected event.

    Lower vector distance means greater semantic similarity.
    This is NOT a percentage or probability.
    """

    if not candidates:
        return candidates

    documents = build_rag_documents(candidates)

    embeddings = HuggingFaceEmbeddings(
        model_name=EMBEDDING_MODEL
    )

    vector_store = Chroma.from_documents(
        documents=documents,
        embedding=embeddings,
        collection_name="maatram_event_" + str(
            selected_event["_id"]
        ),
    )

    event_title = selected_event.get(
        "eventTitle", ""
    )

    event_description = selected_event.get(
        "eventDescription", ""
    )

    volunteer_work = selected_event.get(
        "volunteerWork", ""
    )

    rag_query = f"""
    Event Title:
    {event_title}

    Event Description:
    {event_description}

    Volunteer Responsibilities:
    {volunteer_work}

    Find students whose previous volunteering activities
    are relevant to this event and its responsibilities.
    """

    for candidate in candidates:

        username = candidate["username"]

        results = vector_store.similarity_search_with_score(
            query=rag_query,
            k=1,
            filter={
                "username": username
            }
        )

        if results:
            candidate["rag_distance"] = float(
                results[0][1]
            )
        else:
            candidate["rag_distance"] = float("inf")

    return candidates


# ============================================================
# CLASSIFY HIGH / MEDIUM / LOW
# ============================================================

def classify_candidates(candidates):
    """
    High:
        Maximum participation count in this event.

    Medium:
        Participated in this event at least once,
        but below the maximum.

    Low:
        No previous participation in this event.
    """

    if not candidates:
        return candidates

    maximum_count = max(
        candidate["participation_count"]
        for candidate in candidates
    )

    for candidate in candidates:

        count = candidate["participation_count"]

        if count == 0:
            category = "Low"

        elif count == maximum_count:
            category = "High"

        else:
            category = "Medium"

        candidate["category"] = category

    return candidates


# ============================================================
# DISTANCE-BASED ELIGIBILITY
# ============================================================

def filter_by_radius(candidates, volunteers_needed):
    """
    Start at 20 km.

    If insufficient students are available, increase radius
    by 5 km until enough students are found.

    If all registered candidates are exhausted, stop safely.
    """

    if not candidates:
        return [], INITIAL_RADIUS_KM

    candidates_with_distance = [
        candidate
        for candidate in candidates
        if candidate.get("distance_km") is not None
    ]

    if not candidates_with_distance:
        return [], INITIAL_RADIUS_KM

    maximum_distance = max(
        candidate["distance_km"]
        for candidate in candidates_with_distance
    )

    radius = INITIAL_RADIUS_KM

    while True:

        eligible = [
            candidate
            for candidate in candidates_with_distance
            if candidate["distance_km"] <= radius
        ]

        if len(eligible) >= volunteers_needed:
            return eligible, radius

        # If every candidate is already included,
        # further radius expansion cannot add anyone.
        if radius >= maximum_distance:
            return eligible, radius

        radius = min(
            radius + RADIUS_INCREMENT_KM,
            maximum_distance
        )


# ============================================================
# FCFS + RAG SORTING
# ============================================================

def sort_candidates(candidates):
    """
    Ranking priority:

    1. Lower RAG vector distance.
    2. Earlier registration timestamp (FCFS).
    """

    return sorted(
        candidates,
        key=lambda candidate: (
            candidate.get("rag_distance", float("inf")),
            candidate.get("registered_at")
            or datetime.max.replace(tzinfo=timezone.utc)
        )
    )


# ============================================================
# CATEGORY ALLOCATION
# ============================================================

def calculate_category_seats(total_required):
    """
    Allocate:
        High   = 20%
        Medium = 30%
        Low    = remaining 50%

    Example:
        10 volunteers = 2 High, 3 Medium, 5 Low.
    """

    high_seats = round(
        total_required * HIGH_PERCENTAGE
    )

    medium_seats = round(
        total_required * MEDIUM_PERCENTAGE
    )

    low_seats = (
        total_required
        - high_seats
        - medium_seats
    )

    return {
        "High": high_seats,
        "Medium": medium_seats,
        "Low": low_seats
    }
    
    # ============================================================
# GROQ AI - SELECTION EXPLANATION
# ============================================================

def generate_selection_explanation(candidate, event):
    """
    Generate an explanation for why a student
    was selected for the volunteering event.
    """

    if not groq_client:
        return "AI explanation unavailable: Groq API key missing."

    username = candidate.get("username")
    category = candidate.get("category")
    participation_count = candidate.get("participation_count")
    distance = candidate.get("distance_km")
    rag_distance = candidate.get("rag_distance")
    selection_reason = candidate.get("selection_reason")

    prompt = f"""
    You are an AI assistant for the Maatram volunteering platform.

    Explain why this student was selected for the event.

    Event Details:
    Event Title: {event.get('eventTitle', '')}
    Event Description: {event.get('eventDescription', '')}
    Volunteer Responsibilities: {event.get('volunteerWork', '')}

    Student Details:
    Username: {username}
    Participation Category: {category}
    Previous participation count in this event: {participation_count}
    Distance from event: {distance} km
    RAG vector distance: {rag_distance}
    Selection reason: {selection_reason}

    Instructions:
    1. Explain the student's selection in 2-3 sentences.
    2. Consider event relevance, participation category and distance.
    3. Do not invent student skills or experience.
    4. Do not describe RAG distance as a percentage.
    5. Use simple professional English.
    """

    try:
        response = groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,
            max_completion_tokens=200
        )

        return response.choices[0].message.content.strip()

    except Exception as error:
        print(f"GROQ EXPLANATION ERROR: {error}")
        return "AI explanation could not be generated."


# ============================================================
# FINAL VOLUNTEER SELECTION
# ============================================================

def select_volunteers(candidates, volunteers_needed):
    """
    Select students using category allocation.

    If a category does not have enough candidates,
    remaining seats are redistributed to the best
    unselected Medium/Low candidates using RAG + FCFS.
    """

    category_seats = calculate_category_seats(
        volunteers_needed
    )

    selected = []
    selected_usernames = set()

    category_results = {}

    # --------------------------------------------------------
    # FIRST ROUND: SELECT CATEGORY-WISE ALLOCATION
    # --------------------------------------------------------

    for category in ["High", "Medium", "Low"]:

        category_candidates = [
            candidate
            for candidate in candidates
            if candidate["category"] == category
        ]

        ranked_candidates = sort_candidates(
            category_candidates
        )

        required = category_seats[category]

        chosen = ranked_candidates[:required]

        category_results[category] = {
            "allocated": required,
            "available": len(category_candidates),
            "selected": len(chosen)
        }

        for candidate in chosen:

            candidate["selection_reason"] = (
                "Selected through category allocation"
            )

            selected.append(candidate)

            selected_usernames.add(
                candidate["username"]
            )

    # --------------------------------------------------------
    # SECOND ROUND: REDISTRIBUTE VACANT SEATS
    # --------------------------------------------------------

    vacancies = volunteers_needed - len(selected)

    if vacancies > 0:

        remaining_candidates = [
            candidate
            for candidate in candidates
            if candidate["username"] not in selected_usernames
            and candidate["category"] in ["Medium", "Low"]
        ]

        remaining_candidates = sort_candidates(
            remaining_candidates
        )

        additional_candidates = remaining_candidates[
            :vacancies
        ]

        for candidate in additional_candidates:

            candidate["selection_reason"] = (
                "Selected through vacancy redistribution"
            )

            selected.append(candidate)

            selected_usernames.add(
                candidate["username"]
            )

    # --------------------------------------------------------
    # FINAL RESULT
    # --------------------------------------------------------

    selected = sort_candidates(selected)

    for index, candidate in enumerate(selected, start=1):
        candidate["final_rank"] = index

    return {
        "selected": selected,
        "category_allocation": category_results,
        "total_selected": len(selected),
        "total_required": volunteers_needed,
        "shortfall": max(
            0,
            volunteers_needed - len(selected)
        )
    }


# ============================================================
# MAIN RECOMMENDATION FUNCTION
# ============================================================

def recommend_volunteers(event_id, db):
    """
    Main function called by the Flask API.

    Parameters:
        event_id : Selected MongoDB event ID.
        db       : Existing MongoDB database connection.
    """

    # --------------------------------------------------------
    # 1. VALIDATE EVENT ID
    # --------------------------------------------------------

    if not ObjectId.is_valid(event_id):
        return {
            "success": False,
            "message": "Invalid event ID"
        }, 400

    event_object_id = ObjectId(event_id)

    # --------------------------------------------------------
    # 2. FETCH SELECTED EVENT
    # --------------------------------------------------------

    event = db["events"].find_one({
        "_id": event_object_id
    })

    if not event:
        return {
            "success": False,
            "message": "Event not found"
        }, 404

    if str(event.get("status", "")).lower() != "upcoming":
        return {
            "success": False,
            "message": "Recommendations are available only for upcoming events"
        }, 400

    volunteers_needed = int(
        event.get("volunteersNeeded", 0)
    )

    if volunteers_needed < 1:
        return {
            "success": False,
            "message": "Invalid volunteersNeeded value"
        }, 400

    # --------------------------------------------------------
    # 3. FETCH ONLY REGISTERED STUDENTS
    # --------------------------------------------------------

    registrations = list(
        db["registrations"].find({
            "eventId": event_object_id,
            "status": "Registered"
        }).sort("registeredAt", 1)
    )

    if not registrations:
        return {
            "success": True,
            "message": "No Registered students found for this event",
            "recommendations": [],
            "total_selected": 0,
            "total_required": volunteers_needed
        }, 200

    # --------------------------------------------------------
    # 4. FETCH STUDENT PROFILES
    # --------------------------------------------------------

    usernames = list({
        str(registration.get("studentUsername", ""))
        .strip().upper()
        for registration in registrations
        if registration.get("studentUsername")
    })

    profiles = list(
        db["studentvolunteers"].find({
            "username": {
                "$in": usernames
            },
            "role": {
                "$in": ["student", "alumni"]
            }
        })
    )

    profile_map = {
        str(profile.get("username", "")).strip().upper(): profile
        for profile in profiles
    }

    # --------------------------------------------------------
    # 5. PREPARE EVENT LOCATION
    # --------------------------------------------------------

    event_location = event.get("location", "")

    event_coordinates = get_coordinates(
        event_location
    )

    if not event_coordinates:
        return {
            "success": False,
            "message": "Unable to identify event location"
        }, 400

    # --------------------------------------------------------
    # 6. PREPARE STUDENT LOCATIONS
    # --------------------------------------------------------

    candidates = []

    for registration in registrations:

        username = str(
            registration.get("studentUsername", "")
        ).strip().upper()

        profile = profile_map.get(username)

        if not profile:
            continue

        # Hostel students use profile collegeLocation.
        # Dayscholars use registration address.
        residence_type = str(
            registration.get("residenceType")
            or profile.get("residenceType")
            or profile.get("accommodation_type")
            or ""
            ).strip().lower()

        if "hostel" in residence_type:
            student_location = profile.get(
                "collegeLocation", ""
            )

        else:
            student_location = registration.get(
                "address", ""
            )

        student_coordinates = get_coordinates(
            student_location
        )

        if not student_coordinates:
            continue

        distance_km = round(
            geodesic(
                event_coordinates,
                student_coordinates
            ).kilometers,
            2
        )

        registered_at = parse_datetime(
            registration.get("registeredAt")
        )

        # Exclude registrations made after event start.
        event_start = parse_datetime(
            event.get("startAt")
        )

        if (
            registered_at
            and event_start
            and registered_at > event_start
        ):
            continue

        candidates.append({
            "username": username,
            "name": registration.get(
                "studentName",
                profile.get("name", "Unknown")
            ),

            "registration_id": str(
                registration["_id"]
            ),

            "registered_at": registered_at,
            "distance_km": distance_km,

            "profile": profile,

            "participation_count": (
                get_event_participation_count(
                    profile,
                    event
                )
            )
        })

    # --------------------------------------------------------
    # 7. FILTER USING DYNAMIC RADIUS
    # --------------------------------------------------------

    eligible_candidates, final_radius = filter_by_radius(
        candidates,
        volunteers_needed
    )

    if not eligible_candidates:
        return {
            "success": True,
            "message": "No eligible students with valid locations found",
            "recommendations": [],
            "total_selected": 0,
            "total_required": volunteers_needed,
            "final_radius_km": final_radius
        }, 200

    # --------------------------------------------------------
    # 8. CLASSIFY HIGH / MEDIUM / LOW
    # --------------------------------------------------------

    classify_candidates(
        eligible_candidates
    )

    # --------------------------------------------------------
    # 9. CALCULATE RAG RELEVANCE
    # --------------------------------------------------------

    calculate_rag_relevance(
        eligible_candidates,
        event
    )

    # --------------------------------------------------------
    # 10. SELECT FINAL VOLUNTEERS
    # --------------------------------------------------------

    selection_result = select_volunteers(
        eligible_candidates,
        volunteers_needed
    )

    # --------------------------------------------------------
    # 11. PREPARE SAFE API RESPONSE
    # --------------------------------------------------------

    recommendations = []

    for candidate in selection_result["selected"]:

        ai_explanation = generate_selection_explanation(
            candidate,
            event
        )

        recommendations.append({
            "registrationId": candidate["registration_id"],
            "username": candidate["username"],
            "name": candidate["name"],

            "category": candidate["category"],
            "participationCount": candidate["participation_count"],

            "distanceKm": candidate["distance_km"],
            "ragDistance": round(
                candidate["rag_distance"],
                4
            ),

            "registeredAt": (
                candidate["registered_at"].isoformat()
                if candidate["registered_at"]
                else None
            ),

            "finalRank": candidate["final_rank"],
            "selectionReason": candidate["selection_reason"],
            "aiExplanation": ai_explanation
        })
    # --------------------------------------------------------
    # 12. RETURN RESULT
    # --------------------------------------------------------

    return {
        "success": True,
        "message": "Volunteer recommendations generated successfully",

        "event": {
            "eventId": str(event["_id"]),
            "eventTitle": event.get("eventTitle", ""),
            "location": event.get("location", ""),
            "volunteersNeeded": volunteers_needed
        },

        "registeredStudents": len(registrations),
        "eligibleStudents": len(eligible_candidates),

        "finalRadiusKm": final_radius,

        "categoryAllocation": (
            selection_result["category_allocation"]
        ),

        "totalSelected": selection_result["total_selected"],
        "totalRequired": selection_result["total_required"],
        "shortfall": selection_result["shortfall"],

        "recommendations": recommendations

    }, 200

import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv()

MAIL_USERNAME = os.getenv("MAIL_USERNAME")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")


def send_selection_email(student_email, student_name, event):

    try:
        msg = EmailMessage()

        msg["Subject"] = f"Selected for Volunteering - {event['eventTitle']}"
        msg["From"] = MAIL_USERNAME
        msg["To"] = student_email

        msg.set_content(f"""
Hello {student_name},

Congratulations!

You have been selected for the following volunteering event.

Event: {event['eventTitle']}
Date: {event['date']}
Time: {event['startTime']} - {event['endTime']}
Location: {event['location']}

Work: {event.get('volunteerWork', 'Volunteering')}

Please arrive on time and follow the event instructions.

Regards,
PathFinders Team
Maatram Foundation
""")

        with smtplib.SMTP("smtp.gmail.com", 587,timeout=30) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(MAIL_USERNAME, MAIL_PASSWORD)
            server.send_message(msg)

        return True

    except Exception as e:
        print("Email sending failed:", str(e))
        return False
    
    
    

def send_attendance_thankyou_email(
    student_email,
    student_name,
    event,
    earned_points,
    credited_hours
):
    try:
        msg = EmailMessage()

        msg["Subject"] = (
            f"Thank You for Volunteering - {event['eventTitle']}"
        )
        msg["From"] = MAIL_USERNAME
        msg["To"] = student_email

        msg.set_content(f"""
Hello {student_name},

Thank you for participating in our volunteering event!

Your dedication, time, and contribution towards
making a positive difference are truly appreciated.

EVENT DETAILS

Event: {event['eventTitle']}
Date: {event['date']}
Time: {event['startTime']} - {event['endTime']}
Location: {event['location']}

YOUR VOLUNTEERING ACHIEVEMENTS

Verified Hours: {credited_hours}
Points Earned: {earned_points}

Check Your LeaderBoard!!
Your contribution matters!

Keep volunteering and continue making a difference
in our community.

Regards,
PathFinders Team
Maatram Foundation
""")
        print("DEBUG: Using Gmail SMTP port 587 with STARTTLS")
        with smtplib.SMTP("smtp.gmail.com", 587,timeout=30) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(MAIL_USERNAME, MAIL_PASSWORD)
            server.send_message(msg)

        return True

    except Exception as e:
        print("Thank-you email sending failed:", str(e))
        return False

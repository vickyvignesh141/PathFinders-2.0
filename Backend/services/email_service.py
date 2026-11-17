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

        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(MAIL_USERNAME, MAIL_PASSWORD)
            server.send_message(msg)

        return True

    except Exception as e:
        print("Email sending failed:", str(e))
        return False
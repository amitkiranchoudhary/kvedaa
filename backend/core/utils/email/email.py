import aiosmtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import os
from core import logger

logging = logger(__name__)


async def send_email(subject, to_email, text, html):
    """
    Asynchronously send an email using Gmail SMTP.

    Args:
        subject: Email subject
        to_email: Recipient email address
        text: Plain text content
        html: HTML content

    Returns:
        bool: True if email sent successfully

    Raises:
        Exception: If email sending fails
    """
    try:
        logging.info(f"executing send_email helper function")
        gmail_app_password = os.environ.get("gmail_app_password")
        sent_from = os.environ.get("gmail")
        sent_to = to_email

        # Create the MIMEText object
        message = MIMEMultipart("alternative")
        message["From"] = sent_from
        message["To"] = sent_to
        message["Subject"] = subject

        # Attach the text and html content to the email
        part1 = MIMEText(text, "plain")
        part2 = MIMEText(html, "html")
        message.attach(part1)
        message.attach(part2)

        # Send the email asynchronously
        await aiosmtplib.send(
            message,
            hostname="smtp.gmail.com",
            port=465,
            username=sent_from,
            password=gmail_app_password,
            use_tls=True,
        )

        logging.info(f"Email Sent to {sent_to}")
        print("Email sent!")
        return True
    except Exception as error:
        logging.error(f"Error in send_email function: {error}")
        raise error

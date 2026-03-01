import os
from dotenv import load_dotenv
from twilio.rest import Client

load_dotenv()
account_sid = os.getenv("TWILIO_ACCOUNT_SID")
auth_token = os.getenv("TWILIO_AUTH_TOKEN")
phone_number = os.getenv("TWILIO_PHONE_NUMBER")
public_url = os.getenv("PUBLIC_URL")

client = Client(account_sid, auth_token)

try:
    numbers = client.incoming_phone_numbers.list(phone_number=phone_number)
    if numbers:
        sid = numbers[0].sid
        client.incoming_phone_numbers(sid).update(
            voice_url=f"{public_url}/twiml",
            voice_method="POST"
        )
        print(f"Twilio webhook for {phone_number} successfully updated to {public_url}/twiml")
    else:
        print(f"Phone number {phone_number} not found in this Twilio account.")
except Exception as e:
    print(f"Error configuring Twilio: {e}")

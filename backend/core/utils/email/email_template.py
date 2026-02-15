def get_forgot_password_email_template(username: str, reset_link: str) -> str:
    return f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; color: #333333;">
    <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); overflow: hidden;">
        
        <!-- Header -->
        <div style="background-color: #4F46E5; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Password Reset Request</h1>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Hi {username},</p>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                We received a request to reset your password. No changes have been made to your account yet.
                You can reset your password by clicking the button below:
            </p>
            
            <div style="text-align: center; margin-bottom: 30px;">
                <a href="{reset_link}" style="background-color: #4F46E5; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 16px; display: inline-block;">Reset Your Password</a>
            </div>

            <p style="font-size: 14px; line-height: 1.6; color: #666666; margin-bottom: 10px;">
                If you did not request a password reset, you can safely ignore this email. Your password will remain valid.
            </p>
            <p style="font-size: 14px; line-height: 1.6; color: #666666;">
                This link will expire in 15 minutes for security reasons.
            </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
            <p style="font-size: 12px; color: #999999; margin: 0;">
                © 2026 Your Company Name. All rights reserved.
            </p>
            <p style="font-size: 12px; color: #999999; margin: 5px 0 0 0;">
                If you're having trouble clicking the button, copy and paste the URL below into your web browser:
                <br>
                <a href="{reset_link}" style="color: #4F46E5; text-decoration: none;">{reset_link}</a>
            </p>
        </div>
    </div>
    </div>
</body>
</html>
"""


def get_otp_email_template(username: str, otp: str) -> str:
    return f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset OTP</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; color: #333333;">
    <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); overflow: hidden;">
        
        <!-- Header -->
        <div style="background-color: #4F46E5; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Password Reset OTP</h1>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Hi {username},</p>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                We received a request to reset your password. Use the following OTP to proceed:
            </p>
            
            <div style="text-align: center; margin-bottom: 30px;">
                <span style="background-color: #f3f4f6; color: #4F46E5; padding: 14px 28px; border-radius: 4px; font-weight: 700; font-size: 24px; letter-spacing: 5px; display: inline-block;">{otp}</span>
            </div>

            <p style="font-size: 14px; line-height: 1.6; color: #666666; margin-bottom: 10px;">
                If you did not request a password reset, you can safely ignore this email.
            </p>
            <p style="font-size: 14px; line-height: 1.6; color: #666666;">
                This OTP will expire in 10 minutes.
            </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
            <p style="font-size: 12px; color: #999999; margin: 0;">
                © 2026 Your Company Name. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
"""

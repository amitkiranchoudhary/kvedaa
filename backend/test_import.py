import sys
import os

# Add current directory to sys.path so we can import 'core'
sys.path.append(os.getcwd())

try:
    from core.models.user_model import User, UserStatus
    print(f"UserStatus.INACTIVE: {UserStatus.INACTIVE}")
    print("Import successful")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()

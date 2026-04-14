from flask import request
from services.supabase_client import supabase

def get_user():
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        return None

    try:
        token = auth_header.split(" ")[1]
    except Exception:
        return None


    user_response = supabase.auth.get_user(token)

    if user_response and user_response.user:
        return user_response.user

    return None
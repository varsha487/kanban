import os
from dotenv import load_dotenv
from supabase import create_client

# FORCE load .env from backend folder
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL:
    raise Exception("SUPABASE_URL is missing. Check your .env file.")

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
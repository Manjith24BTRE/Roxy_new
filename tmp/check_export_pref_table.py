import urllib.request
import json

url = "https://vriqwtzyxdnlpagexqay.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyaXF3dHp5eGRubHBhZ2V4cWF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTUwNjgwMywiZXhwIjoyMTAxMDgyODAzfQ.04Y_5qeUW8sT2KzPJAnZVSb_i5qkTTscKWjRMpquvA8"

headers = {
    "Authorization": f"Bearer {key}",
    "apikey": key,
    "Content-Type": "application/json"
}

# Test querying export_preferences table via REST
req = urllib.request.Request(f"{url}/rest/v1/export_preferences?select=*", headers=headers)
try:
    with urllib.request.urlopen(req) as resp:
        print("Table export_preferences status:", resp.status)
        print("Data:", resp.read().decode())
except Exception as e:
    print("Table query error:", e)

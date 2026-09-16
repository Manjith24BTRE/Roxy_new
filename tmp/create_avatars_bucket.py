import urllib.request
import json

url = "https://vriqwtzyxdnlpagexqay.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyaXF3dHp5eGRubHBhZ2V4cWF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTUwNjgwMywiZXhwIjoyMTAxMDgyODAzfQ.04Y_5qeUW8sT2KzPJAnZVSb_i5qkTTscKWjRMpquvA8"

headers = {
    "Authorization": f"Bearer {key}",
    "apikey": key,
    "Content-Type": "application/json"
}

# 1. Create 'avatars' bucket if it doesn't exist
payload = {
    "id": "avatars",
    "name": "avatars",
    "public": True,
    "file_size_limit": 5242880, # 5MB limit
    "allowed_mime_types": ["image/jpeg", "image/jpg", "image/png", "image/webp"]
}

req = urllib.request.Request(
    f"{url}/storage/v1/bucket",
    data=json.dumps(payload).encode('utf-8'),
    headers=headers,
    method="POST"
)

try:
    with urllib.request.urlopen(req) as resp:
        print("Bucket creation response status:", resp.status)
        print("Response:", resp.read().decode())
except Exception as e:
    print("Bucket creation attempt:", e)

# 2. Verify all buckets
req_list = urllib.request.Request(
    f"{url}/storage/v1/bucket",
    headers=headers
)

with urllib.request.urlopen(req_list) as resp:
    buckets = json.loads(resp.read().decode())
    print("\nVerified Storage Buckets in Supabase:")
    for b in buckets:
        print(f" - {b['id']} (public: {b.get('public')})")

import urllib.request
import json
import uuid

url = "https://vriqwtzyxdnlpagexqay.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyaXF3dHp5eGRubHBhZ2V4cWF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTUwNjgwMywiZXhwIjoyMTAxMDgyODAzfQ.04Y_5qeUW8sT2KzPJAnZVSb_i5qkTTscKWjRMpquvA8"

test_user_id = str(uuid.uuid4())
storage_path = f"{test_user_id}/avatar.png"
upload_endpoint = f"{url}/storage/v1/object/avatars/{storage_path}"

headers = {
    "Authorization": f"Bearer {key}",
    "apikey": key,
    "Content-Type": "image/png",
    "x-upsert": "true"
}

# 1. 1x1 Transparent PNG binary data
dummy_png = bytes([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
    0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
    0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
])

req = urllib.request.Request(upload_endpoint, data=dummy_png, headers=headers, method="POST")

try:
    with urllib.request.urlopen(req) as resp:
        print("Upload Response Code:", resp.status)
        print("Upload Response Body:", resp.read().decode())
        
    public_url = f"{url}/storage/v1/object/public/avatars/{storage_path}"
    print("Generated Public URL:", public_url)
    
    # 2. Test fetching public URL
    req_public = urllib.request.Request(public_url)
    with urllib.request.urlopen(req_public) as p_resp:
        print("Public URL Access Status Code:", p_resp.status)
        print("Downloaded Byte Length:", len(p_resp.read()))
        
    # 3. Clean up test file
    del_req = urllib.request.Request(
        f"{url}/storage/v1/object/avatars",
        data=json.dumps({"prefixes": [storage_path]}).encode('utf-8'),
        headers={**headers, "Content-Type": "application/json"},
        method="DELETE"
    )
    with urllib.request.urlopen(del_req) as d_resp:
        print("Cleanup Response Code:", d_resp.status)

except Exception as e:
    print("ERROR:", e)

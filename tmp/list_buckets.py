import urllib.request
import json

url = "https://vriqwtzyxdnlpagexqay.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyaXF3dHp5eGRubHBhZ2V4cWF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTUwNjgwMywiZXhwIjoyMTAxMDgyODAzfQ.04Y_5qeUW8sT2KzPJAnZVSb_i5qkTTscKWjRMpquvA8"

req = urllib.request.Request(
    f"{url}/storage/v1/bucket",
    headers={
        "Authorization": f"Bearer {key}",
        "apikey": key
    }
)

with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode())
    bucket_ids = [b['id'] for b in data]
    print("ALL BUCKET IDS:", bucket_ids)

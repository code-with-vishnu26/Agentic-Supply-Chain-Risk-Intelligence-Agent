import requests
import json

url = "http://localhost:8000/api/v1/intelligence/chat"
payload = {
    "message": "How do you handle local vs. cloud-based LLM reasoning?",
    "history": []
}
headers = {"Content-Type": "application/json"}

try:
    response = requests.post(url, json=payload, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"Error: {e}")

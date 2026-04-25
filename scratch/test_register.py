import requests

name = 'A' * 300
url = 'http://localhost:3000/api/users'
payload = {
    'name': name,
    'email': 'testlongname@example.com',
    'password': 'password123'
}

try:
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")

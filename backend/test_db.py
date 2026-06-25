import requests

try:
    # 1. Register and login User A
    requests.post("http://localhost:8000/api/v1/auth/register", json={
        "email": "userA1@example.com",
        "password": "password123",
        "first_name": "User",
        "last_name": "A"
    })
    res_a = requests.post("http://localhost:8000/api/v1/auth/login", data={
        "username": "userA1@example.com",
        "password": "password123"
    })
    token_a = res_a.json()["access_token"]
    
    # 2. Register and login User B
    requests.post("http://localhost:8000/api/v1/auth/register", json={
        "email": "userB1@example.com",
        "password": "password123",
        "first_name": "User",
        "last_name": "B"
    })
    res_b = requests.post("http://localhost:8000/api/v1/auth/login", data={
        "username": "userB1@example.com",
        "password": "password123"
    })
    token_b = res_b.json()["access_token"]
    
    # 3. User A creates Board
    res = requests.post("http://localhost:8000/api/v1/boards", headers={"Authorization": f"Bearer {token_a}"}, json={
        "name": "Shared Board"
    })
    board_id = res.json()["id"]
    
    # 4. User A generates invite
    res = requests.post(f"http://localhost:8000/api/v1/boards/{board_id}/invites", headers={"Authorization": f"Bearer {token_a}"})
    token_uuid = res.json()["token_uuid"]
    
    # 5. User B joins Board
    res = requests.post(f"http://localhost:8000/api/v1/boards/{board_id}/join?token={token_uuid}", headers={"Authorization": f"Bearer {token_b}"})
    print("User B Join response:", res.status_code, res.text)
    
    # 6. User A gets board detail
    res_a_detail = requests.get(f"http://localhost:8000/api/v1/boards/{board_id}", headers={"Authorization": f"Bearer {token_a}"})
    print("User A Get Board Detail response:", res_a_detail.status_code)

    # 7. User B gets board detail
    res_b_detail = requests.get(f"http://localhost:8000/api/v1/boards/{board_id}", headers={"Authorization": f"Bearer {token_b}"})
    print("User B Get Board Detail response:", res_b_detail.status_code)
    if res_b_detail.status_code != 200:
        print("User B Error:", res_b_detail.text)
    
except Exception as e:
    print(e)

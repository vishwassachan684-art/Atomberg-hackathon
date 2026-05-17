import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_post_api_actions_getcheckins_retrieves_all_checkins():
    url = f"{BASE_URL}/api/actions/getCheckIns"
    headers = {
        "Content-Type": "application/json"
    }
    try:
        response = requests.post(url, headers=headers, timeout=TIMEOUT)
        response.raise_for_status()
        data = response.json()
        # Assert status code 200
        assert response.status_code == 200, f"Expected status code 200 but got {response.status_code}"
        # Assert data is a list (array of check-ins)
        assert isinstance(data, list), f"Expected response to be a list but got {type(data)}"
    except requests.exceptions.RequestException as e:
        assert False, f"Request failed: {e}"

test_post_api_actions_getcheckins_retrieves_all_checkins()
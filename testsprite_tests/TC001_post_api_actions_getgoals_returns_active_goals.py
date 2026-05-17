import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_post_api_actions_getGoals_returns_active_goals():
    url = f"{BASE_URL}/api/actions/getGoals"
    headers = {
        "Content-Type": "application/json"
    }
    try:
        response = requests.post(url, headers=headers, timeout=TIMEOUT)
        # Assert status code is 200
        assert response.status_code == 200, f"Expected status code 200 but got {response.status_code}"
        goals = response.json()
        # Assert response is a list (array of active goals)
        assert isinstance(goals, list), f"Expected response to be a list, got {type(goals)}"
        # Further check that each goal is a dict and has expected fields (at least one goal or empty list allowed)
        for goal in goals:
            assert isinstance(goal, dict), f"Each goal should be a dict, got {type(goal)}"
            # We cannot know exact schema, but typical fields for a goal might include userId, title, description etc
            # Check minimal presence of keys
            expected_keys = ["id", "userId", "title", "description", "thrustArea", "kpis"]
            assert any(key in goal for key in expected_keys), "Goal does not have expected keys"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_post_api_actions_getGoals_returns_active_goals()
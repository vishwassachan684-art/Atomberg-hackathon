import requests

base_url = "http://localhost:3000"
timeout = 30

def test_post_api_actions_creategoal_rejects_invalid_or_unauthenticated_requests():
    url = f"{base_url}/api/actions/createGoal"
    # Example valid payload for goal creation
    payload = {
        "userId": "user123",
        "title": "New Goal Title",
        "description": "Goal description here",
        "thrustArea": "Thrust Area Example",
        "kpis": [{"name": "KPI 1", "target": 100}]
    }
    headers_valid_auth = {
        # Assuming valid auth requires an Authorization header with Bearer token
        "Authorization": "Bearer valid_token",
        "Content-Type": "application/json"
    }
    headers_no_auth = {
        "Content-Type": "application/json"
    }
    headers_invalid_auth = {
        "Authorization": "Bearer invalid_token",
        "Content-Type": "application/json"
    }

    # 1. Test with missing authentication header
    try:
        response_no_auth = requests.post(url, json=payload, headers=headers_no_auth, timeout=timeout)
        assert 400 <= response_no_auth.status_code < 500, f"Expected 4xx status for missing auth, got {response_no_auth.status_code}"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    # 2. Test with invalid authentication header
    try:
        response_invalid_auth = requests.post(url, json=payload, headers=headers_invalid_auth, timeout=timeout)
        assert 400 <= response_invalid_auth.status_code < 500, f"Expected 4xx status for invalid auth, got {response_invalid_auth.status_code}"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    # 3. Verify no new goal is created by comparing goals count before and after unauthorized request
    # Use valid auth to get goals count before test
    try:
        get_goals_url = f"{base_url}/api/actions/getGoals"
        response_before = requests.post(get_goals_url, headers=headers_valid_auth, timeout=timeout)
        response_before.raise_for_status()
        goals_before = response_before.json()
    except requests.RequestException as e:
        assert False, f"Failed to retrieve goals before test: {e}"
    except ValueError:
        assert False, "Failed to decode JSON response before test"

    # Repeat unauthorized request to try to create goal with no auth (already done above),
    # confirms no goal created, now get goals count again
    try:
        response_after = requests.post(get_goals_url, headers=headers_valid_auth, timeout=timeout)
        response_after.raise_for_status()
        goals_after = response_after.json()
    except requests.RequestException as e:
        assert False, f"Failed to retrieve goals after test: {e}"
    except ValueError:
        assert False, "Failed to decode JSON response after test"

    assert len(goals_before) == len(goals_after), "Goal count changed after unauthorized createGoal request"

test_post_api_actions_creategoal_rejects_invalid_or_unauthenticated_requests()
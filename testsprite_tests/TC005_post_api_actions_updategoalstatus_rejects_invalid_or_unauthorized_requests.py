import requests
import uuid

BASE_URL = "http://localhost:3000"
TIMEOUT = 30
AUTH_TOKEN = "Bearer valid-manager-auth-token"  # Replace with valid token if needed

def test_post_api_actions_updategoalstatus_rejects_invalid_or_unauthorized_requests():
    headers_auth = {
        "Authorization": AUTH_TOKEN,
        "Content-Type": "application/json"
    }
    headers_unauth = {
        "Content-Type": "application/json"
    }

    # Step 1: Create a new goal to test status immutability on invalid update attempt
    create_goal_payload = {
        "userId": str(uuid.uuid4()),
        "title": "Test Goal for TC005",
        "description": "Testing updateGoalStatus with invalid or unauthorized requests",
        "thrustArea": "Engineering",
        "kpis": [{"kpi": "Test KPI", "target": "100"}]
    }

    goal_id = None
    try:
        # Create goal with auth
        create_resp = requests.post(
            f"{BASE_URL}/api/actions/createGoal",
            json=create_goal_payload,
            headers=headers_auth,
            timeout=TIMEOUT
        )
        assert create_resp.status_code == 200, f"Goal creation failed with status {create_resp.status_code}"
        created_goal = create_resp.json()
        goal_id = created_goal.get("id") or created_goal.get("goalId") or created_goal.get("_id")
        assert goal_id, "Created goal ID not found in response"

        # Get initial goal status via getGoals (to check later for no change)
        get_goals_resp = requests.post(f"{BASE_URL}/api/actions/getGoals", timeout=TIMEOUT)
        assert get_goals_resp.status_code == 200, f"getGoals failed with status {get_goals_resp.status_code}"
        goals = get_goals_resp.json()
        original_goal = next((g for g in goals if g.get("id") == goal_id or g.get("goalId") == goal_id), None)
        assert original_goal is not None, "Created goal not found in getGoals response"
        original_status = original_goal.get("status")

        # 1. Test updateGoalStatus with invalid goalId (random UUID)
        invalid_goal_id = str(uuid.uuid4())
        invalid_payload = {
            "goalId": invalid_goal_id,
            "status": "approved",
            "managerEmail": "manager@example.com"
        }
        invalid_resp = requests.post(
            f"{BASE_URL}/api/actions/updateGoalStatus",
            json=invalid_payload,
            headers=headers_auth,
            timeout=TIMEOUT
        )
        assert invalid_resp.status_code >= 400, "Expected error response for invalid goalId"
        error_data = invalid_resp.json()
        assert "error" in error_data or "message" in error_data, "Error message expected in invalid goalId response"

        # Confirm original goal status remains unchanged
        get_goals_resp_after_invalid = requests.post(f"{BASE_URL}/api/actions/getGoals", timeout=TIMEOUT)
        assert get_goals_resp_after_invalid.status_code == 200, f"getGoals failed with status {get_goals_resp_after_invalid.status_code}"
        goals_after_invalid = get_goals_resp_after_invalid.json()
        goal_after_invalid = next((g for g in goals_after_invalid if g.get("id") == goal_id or g.get("goalId") == goal_id), None)
        assert goal_after_invalid is not None, "Original goal not found after invalid update attempt"
        assert goal_after_invalid.get("status") == original_status, "Goal status changed after invalid update attempt"

        # 2. Test updateGoalStatus with unauthorized request (no auth header)
        valid_payload = {
            "goalId": goal_id,
            "status": "approved",
            "managerEmail": "manager@example.com"
        }
        unauthorized_resp = requests.post(
            f"{BASE_URL}/api/actions/updateGoalStatus",
            json=valid_payload,
            headers=headers_unauth,
            timeout=TIMEOUT
        )
        assert unauthorized_resp.status_code >= 400, "Expected error response for unauthorized request"
        error_data_unauth = unauthorized_resp.json()
        assert "error" in error_data_unauth or "message" in error_data_unauth, "Error message expected in unauthorized response"

        # Confirm original goal status remains unchanged after unauthorized attempt
        get_goals_resp_after_unauth = requests.post(f"{BASE_URL}/api/actions/getGoals", timeout=TIMEOUT)
        assert get_goals_resp_after_unauth.status_code == 200, f"getGoals failed with status {get_goals_resp_after_unauth.status_code}"
        goals_after_unauth = get_goals_resp_after_unauth.json()
        goal_after_unauth = next((g for g in goals_after_unauth if g.get("id") == goal_id or g.get("goalId") == goal_id), None)
        assert goal_after_unauth is not None, "Original goal not found after unauthorized update attempt"
        assert goal_after_unauth.get("status") == original_status, "Goal status changed after unauthorized update attempt"

    finally:
        # Clean up: Delete the created goal by updating its status to 'deleted' or if delete endpoint existed
        # Since delete endpoint is not defined, reset status or leave as-is.
        # If there's a way to delete via updateGoalStatus or another known method, implement here.
        # For safety, try resetting status to original or a neutral value
        if goal_id:
            reset_payload = {
                "goalId": goal_id,
                "status": original_status,
                "managerEmail": "manager@example.com"
            }
            try:
                requests.post(
                    f"{BASE_URL}/api/actions/updateGoalStatus",
                    json=reset_payload,
                    headers=headers_auth,
                    timeout=TIMEOUT
                )
            except Exception:
                pass

test_post_api_actions_updategoalstatus_rejects_invalid_or_unauthorized_requests()
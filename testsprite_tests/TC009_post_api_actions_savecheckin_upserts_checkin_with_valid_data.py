import requests
import uuid

BASE_URL = "http://localhost:3000"
HEADERS_AUTH = {
    "Content-Type": "application/json",
    "Authorization": "Bearer testauthtoken"  # placeholder for a valid token
}
HEADERS_NO_AUTH = {
    "Content-Type": "application/json"
}
TIMEOUT = 30

def create_goal():
    url = f"{BASE_URL}/api/actions/createGoal"
    payload = {
        "userId": str(uuid.uuid4()),
        "title": "Test Goal for CheckIn",
        "description": "Goal created to test saveCheckIn endpoint",
        "thrustArea": "Testing",
        "kpis": [{"name": "KPI1", "target": 100}]
    }
    response = requests.post(url, json=payload, headers=HEADERS_AUTH, timeout=TIMEOUT)
    response.raise_for_status()
    return response.json()

def delete_goal(goal_id: str):
    # As no delete endpoint is defined in the PRD, we attempt to set status to 'Deleted' or similar if available,
    # otherwise leave as is. Here we omit deletion because no delete API specified.
    pass

def post_save_checkin(goal_id: str):
    url = f"{BASE_URL}/api/actions/saveCheckIn"
    payload = {
        "goalId": goal_id,
        "quarter": 2,
        "actualAchievement": 85,
        "managerFeedback": "Good progress this quarter.",
        "employeeEmail": "employee@example.com"
    }
    response = requests.post(url, json=payload, headers=HEADERS_AUTH, timeout=TIMEOUT)
    return response

def get_checkins_by_goal(goal_id: str):
    url = f"{BASE_URL}/api/actions/getCheckIns"
    payload = {}
    response = requests.post(url, json=payload, headers=HEADERS_NO_AUTH, timeout=TIMEOUT)
    response.raise_for_status()
    checkins = response.json()
    return [c for c in checkins if c.get("goalId") == goal_id]

def test_post_api_actions_savecheckin_upserts_checkin_with_valid_data():
    goal = None
    try:
        # Create a goal to reference for the check-in
        goal = create_goal()
        goal_id = goal.get("id") or goal.get("goalId") or goal.get("_id") or goal.get("uuid")
        assert goal_id is not None, "Created goal must have an ID"

        # First save check-in (create)
        response = post_save_checkin(goal_id)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        saved_checkin = response.json()
        assert saved_checkin.get("goalId") == goal_id, "CheckIn goalId mismatch"
        assert saved_checkin.get("quarter") == 2, "CheckIn quarter mismatch"
        assert saved_checkin.get("actualAchievement") == 85, "CheckIn actualAchievement mismatch"
        assert saved_checkin.get("managerFeedback") == "Good progress this quarter.", "CheckIn managerFeedback mismatch"
        assert saved_checkin.get("employeeEmail") == "employee@example.com", "CheckIn employeeEmail mismatch"

        # Verify persistence by retrieving check-ins and find the new one
        checkins = get_checkins_by_goal(goal_id)
        assert any(c.get("quarter") == 2 and c.get("actualAchievement") == 85 for c in checkins), "Saved check-in not found in storage"

        # Update the same check-in (upsert)
        updated_payload = {
            "goalId": goal_id,
            "quarter": 2,
            "actualAchievement": 90,
            "managerFeedback": "Updated feedback.",
            "employeeEmail": "employee@example.com"
        }
        url = f"{BASE_URL}/api/actions/saveCheckIn"
        response_update = requests.post(url, json=updated_payload, headers=HEADERS_AUTH, timeout=TIMEOUT)
        assert response_update.status_code == 200, f"Expected 200 on update, got {response_update.status_code}"
        updated_checkin = response_update.json()
        assert updated_checkin.get("actualAchievement") == 90, "CheckIn actualAchievement not updated"
        assert updated_checkin.get("managerFeedback") == "Updated feedback.", "CheckIn managerFeedback not updated"

        # Confirm update persistence in retrieved checkins
        checkins_after_update = get_checkins_by_goal(goal_id)
        found_updated = next((c for c in checkins_after_update if c.get("quarter") == 2), None)
        assert found_updated is not None, "Updated check-in not found"
        assert found_updated.get("actualAchievement") == 90, "Persisted check-in actualAchievement not updated"
        assert found_updated.get("managerFeedback") == "Updated feedback.", "Persisted check-in managerFeedback not updated"

    finally:
        # Clean up: delete the goal if deletion endpoint existed
        # No deletion endpoint defined; so skip actual deletion
        pass

test_post_api_actions_savecheckin_upserts_checkin_with_valid_data()
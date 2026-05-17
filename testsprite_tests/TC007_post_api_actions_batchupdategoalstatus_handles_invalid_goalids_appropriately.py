import requests
import uuid

BASE_URL = "http://localhost:3000"
HEADERS_AUTH = {
    "Authorization": "Bearer valid_admin_token",
    "Content-Type": "application/json"
}
HEADERS_NO_AUTH = {
    "Content-Type": "application/json"
}

def create_goal(user_id, title, description, thrustArea, kpis):
    url = f"{BASE_URL}/api/actions/createGoal"
    payload = {
        "userId": user_id,
        "title": title,
        "description": description,
        "thrustArea": thrustArea,
        "kpis": kpis
    }
    resp = requests.post(url, json=payload, headers=HEADERS_AUTH, timeout=30)
    resp.raise_for_status()
    return resp.json()

def delete_goal(goal_id):
    # Assuming API does not provide a delete endpoint, no action here.
    # If delete endpoint existed, would implement here.
    pass

def batch_update_goal_status(goalIds, status, managerEmail):
    url = f"{BASE_URL}/api/actions/batchUpdateGoalStatus"
    payload = {
        "goalIds": goalIds,
        "status": status,
        "managerEmail": managerEmail
    }
    resp = requests.post(url, json=payload, headers=HEADERS_AUTH, timeout=30)
    return resp

def get_goals():
    url = f"{BASE_URL}/api/actions/getGoals"
    resp = requests.post(url, headers=HEADERS_NO_AUTH, timeout=30)
    resp.raise_for_status()
    return resp.json()

def test_post_api_actions_batchupdategoalstatus_handles_invalid_goalids_appropriately():
    # Create two valid goals
    created_goals = []
    try:
        for i in range(2):
            user_id = str(uuid.uuid4())
            title = f"Test Goal {i} " + str(uuid.uuid4())
            description = "Test Description"
            thrustArea = "Test Thrust Area"
            kpis = [{"kpiName": "KPI1", "target": 100}]
            goal = create_goal(user_id, title, description, thrustArea, kpis)
            assert "id" in goal and isinstance(goal["id"], str)
            created_goals.append(goal)

        valid_goal_ids = [goal["id"] for goal in created_goals]
        invalid_goal_id = "invalid-goal-id-12345"

        # Compose batch update payload with valid and invalid goalIds
        batch_goal_ids = valid_goal_ids + [invalid_goal_id]
        status = "Approved"
        manager_email = "manager@example.com"

        response = batch_update_goal_status(batch_goal_ids, status, manager_email)

        # The API documentation states it can return an error or partial failure response
        # Validate accordingly

        if response.status_code == 200:
            result = response.json()
            # Result could be an object indicating partial success/failure
            # Verify valid goals got updated by fetching goals and checking status, or by any indicator in result
            assert isinstance(result, dict)
            # Check if there is indication of partial failure or errors in result
            # We expect keys like 'updatedGoalIds' or 'failedGoalIds' or error messages
            updated_goal_ids = result.get("updatedGoalIds") or result.get("successIds") or []
            failed_goal_ids = result.get("failedGoalIds") or result.get("errorIds") or []

            # Assert that valid goals are either updated or batch rejected
            # Two options: either all valid goals updated, or batch rejected (none updated)
            # So the valid goal ids are either all in updated_goal_ids or none updated (batch rejected)

            valid_updated = all(gid in updated_goal_ids for gid in valid_goal_ids)
            valid_failed = all(gid in failed_goal_ids for gid in valid_goal_ids)
            # valid_updated or valid_failed, batch partial or rejected
            # At least invalid_goal_id should be in failed_goal_ids
            assert invalid_goal_id in failed_goal_ids or invalid_goal_id in result.get("errors", [])

            # To further validate, fetch goals and check their status for valid goals updated if partial success
            # But since we do not have an "GET goal by ID", use getGoals
            goals_list = get_goals()
            id_to_goal = {g.get("id"): g for g in goals_list}
            for gid in valid_goal_ids:
                if gid in updated_goal_ids:
                    assert id_to_goal[gid]["status"] == status
            # If batch rejected all valid goals should remain untouched (not status updated)
            # So if none in updated_goal_ids, status unchanged

        else:
            # Expecting 4xx or 5xx error response for batch reject scenario
            assert response.status_code >= 400 and response.status_code < 500

    finally:
        # Cleanup: No delete endpoint described, so cannot delete created goals
        # In a real environment, would delete or reset DB test data here
        pass


test_post_api_actions_batchupdategoalstatus_handles_invalid_goalids_appropriately()
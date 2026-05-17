import requests
import uuid

BASE_URL = "http://localhost:3000"
TIMEOUT = 30
AUTH_HEADERS = {
    "Authorization": "Bearer YOUR_AUTH_TOKEN_HERE",
    "Content-Type": "application/json"
}

def test_post_api_actions_updategoalstatus_updates_status_with_valid_data():
    created_goal_id = None
    user_id = str(uuid.uuid4())
    manager_email = "manager@example.com"
    try:
        # Step 1: Create a new goal to update its status later
        create_goal_payload = {
            "userId": user_id,
            "title": "Test Goal for UpdateStatus",
            "description": "Goal created to test updateGoalStatus endpoint",
            "thrustArea": "Innovation",
            "kpis": [
                {"name": "KPI 1", "target": 100},
                {"name": "KPI 2", "target": 200}
            ]
        }
        create_response = requests.post(
            f"{BASE_URL}/api/actions/createGoal",
            json=create_goal_payload,
            headers=AUTH_HEADERS,
            timeout=TIMEOUT,
        )
        assert create_response.status_code == 200, f"Create goal failed with status {create_response.status_code}"
        goal = create_response.json()
        assert "id" in goal and goal["id"], "Created goal response missing 'id'"
        created_goal_id = goal["id"]

        # Step 2: Update the goal status using the created goal id
        update_status_payload = {
            "goalId": created_goal_id,
            "status": "Approved",
            "managerEmail": manager_email
        }
        update_response = requests.post(
            f"{BASE_URL}/api/actions/updateGoalStatus",
            json=update_status_payload,
            headers=AUTH_HEADERS,
            timeout=TIMEOUT,
        )
        assert update_response.status_code == 200, f"Update status failed with status {update_response.status_code}"
        updated_status_obj = update_response.json()
        # Validate the updated status object contains the expected fields and updated status
        assert isinstance(updated_status_obj, dict), "Response is not an object"
        assert updated_status_obj.get("goalId") == created_goal_id, "Updated status object goalId mismatch"
        assert updated_status_obj.get("status") == "Approved", "Goal status was not updated correctly"
        assert "approvalLog" in updated_status_obj or "rejectionLog" in updated_status_obj, "Approval or rejection log missing"

        # Step 3: Confirm the goal status was changed by fetching goals and locating updated goal
        get_goals_response = requests.post(
            f"{BASE_URL}/api/actions/getGoals",
            headers={"Content-Type": "application/json"},
            timeout=TIMEOUT,
        )
        assert get_goals_response.status_code == 200, f"Get goals failed with status {get_goals_response.status_code}"
        goals = get_goals_response.json()
        assert isinstance(goals, list), "Goals should be a list"
        matching_goals = [g for g in goals if g.get("id") == created_goal_id]
        assert matching_goals, f"Goal with id {created_goal_id} not found in goals list"
        goal_after_update = matching_goals[0]
        assert goal_after_update.get("status") == "Approved", "The goal status in list is not updated"

    finally:
        # Clean up: delete the created goal to not pollute DB if API supports deleteGoal (not in PRD, so we skip)
        pass

test_post_api_actions_updategoalstatus_updates_status_with_valid_data()

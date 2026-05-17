import requests
import uuid

BASE_URL = "http://localhost:3000"
TIMEOUT = 30
AUTH_TOKEN = "Bearer your_valid_auth_token_here"  # Replace with valid token for authentication

headers = {
    "Authorization": AUTH_TOKEN,
    "Content-Type": "application/json"
}

def create_goal(user_id, title, description, thrust_area, kpis):
    payload = {
        "userId": user_id,
        "title": title,
        "description": description,
        "thrustArea": thrust_area,
        "kpis": kpis
    }
    response = requests.post(
        f"{BASE_URL}/api/actions/createGoal",
        json=payload,
        headers=headers,
        timeout=TIMEOUT
    )
    response.raise_for_status()
    return response.json()

def delete_goal(goal_id):
    # No explicit delete endpoint mentioned; assuming no direct delete endpoint.
    # If there was, it should be called here.
    pass

def get_goals():
    response = requests.post(
        f"{BASE_URL}/api/actions/getGoals",
        timeout=TIMEOUT
    )
    response.raise_for_status()
    return response.json()

def batch_update_goal_status(goal_ids, status, manager_email):
    payload = {
        "goalIds": goal_ids,
        "status": status,
        "managerEmail": manager_email
    }
    response = requests.post(
        f"{BASE_URL}/api/actions/batchUpdateGoalStatus",
        json=payload,
        headers=headers,
        timeout=TIMEOUT
    )
    return response

def test_post_api_actions_batchupdategoalstatus_bulk_updates_multiple_goals():
    user_id = str(uuid.uuid4())
    manager_email = "manager@example.com"
    created_goal_ids = []
    try:
        # Create multiple goals to update
        goal1 = create_goal(
            user_id=user_id,
            title="Goal 1 - TC006",
            description="Description for goal 1",
            thrust_area="Thrust Area A",
            kpis=[{"kpi": "Metric 1", "target": "Value 1"}]
        )
        created_goal_ids.append(goal1["id"])

        goal2 = create_goal(
            user_id=user_id,
            title="Goal 2 - TC006",
            description="Description for goal 2",
            thrust_area="Thrust Area B",
            kpis=[{"kpi": "Metric 2", "target": "Value 2"}]
        )
        created_goal_ids.append(goal2["id"])

        # Perform batch update of status
        new_status = "Approved"
        resp = batch_update_goal_status(
            goal_ids=created_goal_ids,
            status=new_status,
            manager_email=manager_email
        )

        assert resp.status_code == 200, f"Expected status code 200, got {resp.status_code}"
        resp_json = resp.json()
        assert isinstance(resp_json, dict), "Response should be an object"
        # Expecting some bulk update result - at least keys goalIds and status or similar
        assert "updatedCount" in resp_json or "success" in resp_json or "updatedGoals" in resp_json, "Response missing bulk update result details"

        # Verify all matching goals are updated accordingly via getGoals call
        goals = get_goals()
        # Filter goals created in this test by ID
        updated_goals = [g for g in goals if g.get("id") in created_goal_ids]
        assert len(updated_goals) == len(created_goal_ids), f"Expected {len(created_goal_ids)} goals, found {len(updated_goals)}"

        for g in updated_goals:
            assert g.get("status") == new_status, f"Goal ID {g.get('id')} status not updated to {new_status}"

    finally:
        # Cleanup: No delete endpoint provided, so skipping explicit deletion
        # If delete endpoint existed, would delete goals here to avoid test pollution
        pass

test_post_api_actions_batchupdategoalstatus_bulk_updates_multiple_goals()
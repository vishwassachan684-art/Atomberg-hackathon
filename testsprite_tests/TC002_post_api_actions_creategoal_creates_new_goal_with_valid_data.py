import requests
import uuid

BASE_URL = "http://localhost:3000"
CREATE_GOAL_PATH = "/api/actions/createGoal"
GET_GOALS_PATH = "/api/actions/getGoals"
TIMEOUT = 30

# Assuming an authentication token is required for the createGoal endpoint
# This token must be valid for the test environment
AUTH_TOKEN = "Bearer valid-authentication-token"


def test_post_api_actions_creategoal_creates_new_goal_with_valid_data():
    headers = {
        "Authorization": AUTH_TOKEN,
        "Content-Type": "application/json"
    }

    # Prepare unique test data
    unique_user_id = str(uuid.uuid4())
    unique_title = f"Test Goal Title {uuid.uuid4()}"
    unique_description = "This is a test goal description."
    unique_thrust_area = "Innovation"
    kpis = [{"name": "KPI1", "target": 100}, {"name": "KPI2", "target": 200}]

    create_goal_payload = {
        "userId": unique_user_id,
        "title": unique_title,
        "description": unique_description,
        "thrustArea": unique_thrust_area,
        "kpis": kpis
    }

    created_goal_id = None

    try:
        # Create new goal via POST /api/actions/createGoal
        create_response = requests.post(
            BASE_URL + CREATE_GOAL_PATH,
            json=create_goal_payload,
            headers=headers,
            timeout=TIMEOUT
        )

        assert create_response.status_code == 200, f"Expected status 200, got {create_response.status_code}"
        created_goal = create_response.json()
        # Validate returned goal fields match the sent data
        assert isinstance(created_goal, dict), "Created goal response is not a dict"
        assert created_goal.get("userId") == unique_user_id
        assert created_goal.get("title") == unique_title
        assert created_goal.get("description") == unique_description
        assert created_goal.get("thrustArea") == unique_thrust_area
        assert isinstance(created_goal.get("kpis"), list)
        # Save ID for cleanup and further validation
        created_goal_id = created_goal.get("id") or created_goal.get("goalId")  # depending on API response naming
        assert created_goal_id is not None, "Created goal ID is missing in response"

        # Verify that the goal is persisted and retrievable via GET /api/actions/getGoals
        get_goals_response = requests.post(
            BASE_URL + GET_GOALS_PATH,
            headers={"Content-Type": "application/json"},
            timeout=TIMEOUT
        )
        assert get_goals_response.status_code == 200, f"Expected status 200 on getGoals, got {get_goals_response.status_code}"
        goals_list = get_goals_response.json()
        assert isinstance(goals_list, list), "getGoals response is not a list"
        # Check the created goal is present in the goals list by ID or unique title
        found_goal = next((g for g in goals_list if g.get("id") == created_goal_id or g.get("title") == unique_title), None)
        assert found_goal is not None, "Created goal not found in goals list"
        # Further verify fields to ensure persistence integrity
        assert found_goal.get("userId") == unique_user_id
        assert found_goal.get("description") == unique_description
        assert found_goal.get("thrustArea") == unique_thrust_area
        assert isinstance(found_goal.get("kpis"), list)
    finally:
        # Cleanup: delete the created goal if an API existed to delete goals
        # The PRD does not document a delete endpoint, so this is not implemented.
        # If such endpoint exists, use try-finally here to remove created data.
        pass


test_post_api_actions_creategoal_creates_new_goal_with_valid_data()
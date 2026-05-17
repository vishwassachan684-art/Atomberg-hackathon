import requests

BASE_URL = "http://localhost:3000"
SAVE_CHECKIN_ENDPOINT = "/api/actions/saveCheckIn"
TIMEOUT = 30
AUTH_HEADER_VALID = {"Authorization": "Bearer valid_token_example"}
AUTH_HEADER_INVALID = {"Authorization": "Bearer invalid_token_example"}


def test_post_api_actions_savecheckin_rejects_invalid_or_unauthorized_requests():
    url = BASE_URL + SAVE_CHECKIN_ENDPOINT

    # Test data variants for invalid requests
    test_cases = [
        # 1. Invalid goalId (assuming goalId should be a valid UUID string)
        {
            "payload": {
                "goalId": "invalid-goal-id",
                "quarter": 1,
                "actualAchievement": 75,
                "managerFeedback": "Good progress",
                "employeeEmail": "employee@example.com"
            },
            "headers": AUTH_HEADER_VALID,
            "expected_status_code": 4,
        },
        # 2. Malformed achievement data (actualAchievement is a string instead of number)
        {
            "payload": {
                "goalId": "00000000-0000-0000-0000-000000000000",
                "quarter": 1,
                "actualAchievement": "eighty-five",
                "managerFeedback": "Needs improvement",
                "employeeEmail": "employee@example.com"
            },
            "headers": AUTH_HEADER_VALID,
            "expected_status_code": 4,
        },
        # 3. Missing employeeEmail
        {
            "payload": {
                "goalId": "00000000-0000-0000-0000-000000000000",
                "quarter": 1,
                "actualAchievement": 90,
                "managerFeedback": "Well done"
            },
            "headers": AUTH_HEADER_VALID,
            "expected_status_code": 4,
        },
        # 4. Unauthorized request (missing Authorization header)
        {
            "payload": {
                "goalId": "00000000-0000-0000-0000-000000000000",
                "quarter": 2,
                "actualAchievement": 88,
                "managerFeedback": "Keep it up",
                "employeeEmail": "employee@example.com"
            },
            "headers": {},  # No auth header
            "expected_status_code": 4,
        },
        # 5. Unauthorized request (invalid Authorization header)
        {
            "payload": {
                "goalId": "00000000-0000-0000-0000-000000000000",
                "quarter": 3,
                "actualAchievement": 95,
                "managerFeedback": "Excellent",
                "employeeEmail": "employee@example.com"
            },
            "headers": AUTH_HEADER_INVALID,
            "expected_status_code": 4,
        },
    ]

    for case in test_cases:
        try:
            response = requests.post(
                url,
                headers={**{"Content-Type": "application/json"}, **case["headers"]},
                json=case["payload"],
                timeout=TIMEOUT,
            )
        except requests.RequestException as e:
            assert False, f"Request failed unexpectedly: {e}"

        # Assert status code is 4xx error
        assert 400 <= response.status_code < 500, (
            f"Expected 4xx client error for payload {case['payload']} with headers {case['headers']}, "
            f"but got status code {response.status_code} and response {response.text}"
        )

    # Additionally verify that no check-in is saved or updated by trying to retrieve check-ins for the invalid or missing data
    # Since no API directly fetches checkIn by single attributes, we'll skip this step or assume backend prevents saving by status code per PRD.


test_post_api_actions_savecheckin_rejects_invalid_or_unauthorized_requests()
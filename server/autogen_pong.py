# autogen_pong.py

import os
import re
import autogen
from pydantic import BaseModel, Field, validator
from dotenv import load_dotenv

load_dotenv()

key = os.getenv("OPENAI_API_KEY")
print("Loaded key:", key[:5] + "..." + key[-4:] if key else "None")

# Build config_list for OpenAI or Azure
config_list = []

if os.getenv("OPENAI_API_TYPE") == "azure":
    config_list = [{
        "model": os.getenv("OPENAI_DEPLOYMENT_ID"),  # your Azure deployment name
        "api_key": os.getenv("OPENAI_API_KEY"),
        "base_url": os.getenv("OPENAI_API_BASE"),
        "api_type": "azure",
        "api_version": os.getenv("OPENAI_API_VERSION"),
    }]
else:
    config_list = [{
        "model": os.getenv("OPENAI_DEPLOYMENT_ID", "gpt-4o"),
        "api_key": os.getenv("OPENAI_API_KEY"),
    }]

# Apply to llm_config
llm_config = {
    "config_list": config_list,
    "temperature": 0.2
}

# Define Pydantic model for structured input
class PaddleInput(BaseModel):
    ball_y: int = Field(..., alias="Ball Y")
    paddle_y: int = Field(..., alias="Paddle Y")
    paddle_center: int = Field(..., alias="Paddle Center")
    ball_moving: str = Field(..., alias="Ball moving")
    distance: int = Field(..., alias="Distance from ball")
    near_top: bool = Field(..., alias="Near top boundary")
    near_bottom: bool = Field(..., alias="Near bottom boundary")

    @validator("ball_moving")
    def validate_direction(cls, v):
        if v not in {"up", "down"}:
            raise ValueError("Direction must be 'up' or 'down'")
        return v


# Define agents
left_paddle_agent = autogen.AssistantAgent(
    name="LeftPaddleAgent",
    system_message="You control the LEFT paddle in a game of Pong. The only valid responses are: 'up', 'down', or 'stay'. Respond with ONE of these words only.",
    llm_config=llm_config
)

right_paddle_agent = autogen.AssistantAgent(
    name="RightPaddleAgent",
        system_message = (
            "You control the RIGHT paddle in Pong.\n"
            "You will receive:\n"
            "- Ball Y position (0 to 600)\n"
            "- Paddle Y position (0 to 600)\n"
            "- Paddle center (Y + 40)\n"
            "- Ball movement direction: 'up' or 'down'\n"
            "- Distance from ball (abs difference between ball Y and paddle center)\n"
            "- Near top boundary: true or false\n"
            "- Near bottom boundary: true or false\n\n"
            "Your job is to align the paddle CENTER with the ball Y position.\n"
            "Only move if the ball is more than ±10 pixels away from the paddle center.\n"
            "If you're near the top or bottom, avoid illegal moves.\n\n"
            "Return ONLY one of the following:\n"
            "- 0 to move the paddle DOWN\n"
            "- 1 to move the paddle UP\n"
            "- 2 to STAY\n\n"
            "Respond with a single number only: 0, 1, or 2. Do not include any explanations, text, or punctuation."
        ),
    llm_config=llm_config
)

# Paddle decision function
def get_paddle_move(agent, ball_position_description):
    # Parse input
    try:
        fields = [f.strip() for f in ball_position_description.split(",")]
        input_dict = dict(f.split(": ") for f in fields)
        structured = PaddleInput.parse_obj(input_dict)
        print("✅ Parsed input:", structured)
    except Exception as e:
        print("❌ Failed to parse input:", e)
        return "1"  # default safe fallback

    # AI raw suggestion
    result = agent.generate_oai_reply(
        messages=[{"role": "user", "content": ball_position_description}]
    )
    print("🧠 Raw LLM output:", result)

    if isinstance(result, tuple):
        _, response = result
    else:
        response = result

    cleaned = str(response).strip()

    # Extract first digit from response
    match = re.search(r"\b([012])\b", cleaned)
    if match:
        move = match.group(1)
    else:
        print("❌ No valid move found, defaulting to 1")
        move = "1"

    # Clamp override (only if not '2')
    if move != "2":
        if structured.paddle_y <= 0 and move == "1":
            return "2"
        elif structured.paddle_y >= 520 and move == "0":
            return "2"

    print(f"📊 Debug: Ball Y = {structured.ball_y}, Paddle Y = {structured.paddle_y}, Paddle center = {structured.paddle_y + 40}")


    return move

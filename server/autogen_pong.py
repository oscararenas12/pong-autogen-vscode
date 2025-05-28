# autogen_pong.py

import os
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
        "model": os.getenv("OPENAI_DEPLOYMENT_ID", "gpt-3.5-turbo"),
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
    ball_moving: str = Field(..., alias="Ball moving")

    @validator("ball_moving")
    def validate_direction(cls, v):
        if v not in {"up", "down"}:
            raise ValueError("Direction must be 'up' or 'down'")
        return v


    def convert_direction(cls, v):
        direction_map = {"down": 0, "up": 1}
        if v not in direction_map:
            raise ValueError("Direction must be 'up' or 'down'")
        return direction_map[v]

# Define agents
left_paddle_agent = autogen.AssistantAgent(
    name="LeftPaddleAgent",
    system_message="You control the LEFT paddle in a game of Pong. The only valid responses are: 'up', 'down', or 'stay'. Respond with ONE of these words only.",
    llm_config=llm_config
)

right_paddle_agent = autogen.AssistantAgent(
    name="RightPaddleAgent",
        system_message=(
            "You control the RIGHT paddle in Pong.\n"
            "You will receive:\n"
            "- Ball Y position (0 to 600)\n"
            "- Paddle Y position (0 to 600, paddle height = 80)\n"
            "- Ball movement direction: 'up' or 'down'\n\n"
            "Your job is to keep the paddle aligned with the ball.\n"
            "Return:\n"
            "- 0 to move the paddle DOWN\n"
            "- 1 to move the paddle UP\n\n"
            "Rules:\n"
            "- If Paddle Y is 0, always return 0 (you cannot go higher)\n"
            "- If Paddle Y is 520 or greater, always return 1 (you cannot go lower)\n"
            "- Otherwise, try to center the paddle vertically on the ball\n\n"
            "Examples:\n"
            "- Ball Y: 570, Paddle Y: 495, Ball moving: down → Output: 0\n"
            "- Ball Y: 200, Paddle Y: 300, Ball moving: up → Output: 1\n"
            "- Ball Y: 150, Paddle Y: 150, Ball moving: up → Output: 1\n"
            "- Ball Y: 350, Paddle Y: 370, Ball moving: down → Output: 0"
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

    # 🚧 Override logic if paddle is clamped
    if structured.paddle_y <= 0:
        print("⛔ At top: forcing move = 0")
        return "0"
    elif structured.paddle_y >= 520:
        print("⛔ At bottom: forcing move = 1")
        return "1"

    return cleaned if cleaned in ["0", "1"] else "1"



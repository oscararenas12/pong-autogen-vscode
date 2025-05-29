# autogen_pong.py

import os
import autogen
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

key = os.getenv("OPENAI_API_KEY")
print("Loaded key:", key[:5] + "..." + key[-4:] if key else "None")

# Build config_list for OpenAI or Azure
config_list = []

if os.getenv("OPENAI_API_TYPE") == "azure":
    config_list = [{
        "model": os.getenv("OPENAI_DEPLOYMENT_ID"),
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

# LLM config
llm_config = {
    "config_list": config_list,
    "temperature": 0.2
}

# Define GameState model using Pydantic
class GameState(BaseModel):
    ball_y: int = Field(..., alias="Ball Y")
    paddle_y: int = Field(..., alias="Paddle Y")
    ball_moving: str = Field(..., alias="Ball moving")  # "up" or "down"

    def to_prompt(self):
        return (
            f"Ball Y: {self.ball_y}, "
            f"Paddle Y: {self.paddle_y}, "
            f"Ball moving: {self.ball_moving} "
        )


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
        "- Ball Y position\n"
        "- Paddle Y position\n"
        "- Ball movement direction ('up' or 'down')\n\n"
        "Respond with ONE WORD ONLY: 'up', 'down', or 'stay'.\n"
        "NO punctuation. NO explanation. Just the move.\n\n"
        "Examples:\n"
        "- Input: Ball Y: 400, Paddle Y: 300, Ball moving: down → Output: down\n"
        "- Input: Ball Y: 250, Paddle Y: 250, Ball moving: up → Output: stay\n"
        "- Input: Ball Y: 100, Paddle Y: 200, Ball moving: up → Output: up"
    ),
    llm_config=llm_config
)

# Paddle decision function
def get_paddle_move(agent, ball_position_description):
    result = agent.generate_oai_reply(
        messages=[{"role": "user", "content": ball_position_description}]
    )
    print("🧠 Raw LLM output:", result)

    # If the result is a tuple (sometimes returned by autogen), unpack it
    if isinstance(result, tuple):
        _, response = result
    else:
        response = result

    cleaned = str(response).strip().lower()

    if cleaned not in ["up", "down", "stay"]:
        return "stay"

    return cleaned

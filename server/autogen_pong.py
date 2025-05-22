# autogen_pong.py

import os
import autogen
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

# Define agents
left_paddle_agent = autogen.AssistantAgent(
    name="LeftPaddleAgent",
    system_message="You control the LEFT paddle in a game of Pong. The only valid responses are: 'up', 'down', or 'stay'. Respond with ONE of these words only.",
    llm_config=llm_config
)

right_paddle_agent = autogen.AssistantAgent(
    name="RightPaddleAgent",
    system_message="You control the RIGHT paddle in a game of Pong. The only valid responses are: 'up', 'down', or 'stay'. Respond with ONE of these words only.",
    llm_config=llm_config
)

# Paddle decision function
def get_paddle_move(agent, ball_position_description):
    result = agent.generate_oai_reply(
        messages=[{"role": "user", "content": ball_position_description}]
    )

    if isinstance(result, tuple):
        response, _ = result
    else:
        response = result

    cleaned = str(response).strip().lower()

    # Only allow expected values
    if cleaned not in ["up", "down", "stay"]:
        return "stay"  # Default fallback

    return cleaned


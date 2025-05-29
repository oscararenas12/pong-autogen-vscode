# app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
from autogen_pong import left_paddle_agent, right_paddle_agent, get_paddle_move, GameState

app = Flask(__name__)
CORS(app)

@app.route("/move_paddle", methods=["POST"])
def move_paddle():
    data = request.json
    paddle = data.get("paddle")
    raw = data.get("ball_position")

    print("📥 Raw received:", raw)

    try:
        # Parse string into dict
        fields = dict(f.strip().split(": ") for f in raw.split(","))
        game_state = GameState.model_validate(fields)
        prompt = game_state.to_prompt()

        print("🧠 Final AI prompt:", prompt)

        agent = left_paddle_agent if paddle == "left" else right_paddle_agent
        move = get_paddle_move(agent, prompt)
        return jsonify({"move": move})

    except Exception as e:
        print("❌ Failed to construct AI input:", e)
        return jsonify({"move": "stay"})

if __name__ == "__main__":
    app.run(port=5000, debug=True)

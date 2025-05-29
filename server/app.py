# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from autogen_pong import left_paddle_agent, right_paddle_agent, get_paddle_move

app = Flask(__name__)
CORS(app)

@app.route("/move_paddle", methods=["POST"])
def move_paddle():
    data = request.json
    paddle = data.get("paddle")  # "left" or "right"
    raw = data.get("ball_position")

    print("📥 Raw received:", raw)

    try:
        # Parse values from the string input
        fields = dict(f.strip().split(": ") for f in raw.split(","))
        ball_y = int(fields["Ball Y"])
        paddle_y = int(fields["Paddle Y"])
        paddle_center = int(float(fields["Paddle Center"]))
        ball_moving = fields["Ball moving"]

        # ➕ Compute context
        distance = abs(ball_y - paddle_center)
        near_top = paddle_y <= 0
        near_bottom = paddle_y >= 520

        # 👇 Compose new input string with context
        contextual_prompt = (
            f"Ball Y: {ball_y}, "
            f"Paddle Y: {paddle_y}, "
            f"Paddle Center: {paddle_center}, "
            f"Ball moving: {ball_moving}, "
            f"Distance from ball: {distance}, "
            f"Near top boundary: {near_top}, "
            f"Near bottom boundary: {near_bottom}"
        )

        print("🧠 Final AI prompt:", contextual_prompt)

        # Route to agent
        agent = left_paddle_agent if paddle == "left" else right_paddle_agent
        move = get_paddle_move(agent, contextual_prompt)
        return jsonify({"move": move})

    except Exception as e:
        print("❌ Failed to construct AI input:", e)
        return jsonify({"move": "2"})  # fallback to STAY
    return jsonify({"move": move})

if __name__ == "__main__":
    app.run(port=5000, debug=True)


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
    ball_position = data.get("ball_position")

    agent = left_paddle_agent if paddle == "left" else right_paddle_agent
    move = get_paddle_move(agent, ball_position)

    return jsonify({"move": move})

if __name__ == "__main__":
    app.run(port=5000, debug=True)

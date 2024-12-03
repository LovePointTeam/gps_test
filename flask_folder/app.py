# import pandas as pd
# from flask import Flask, jsonify
# app = Flask(__name__)
# INTERVAL = 5

# @app.route('/set_gps_interval/<time>')
# def set_interval(time):
#     global INTERVAL
#     try:
#         INTERVAL = int(time)  # Convert to integer
#         print("set_gps_interval to " + str(INTERVAL))
#         return jsonify({"interval": INTERVAL})
#     except ValueError:
#         return jsonify({"error": "Invalid time value"}), 400

# @app.route('/get-interval')
# def get_interval():
#     global INTERVAL
#     return jsonify({"interval": INTERVAL})

# @app.route('/<long>/<lat>/<user_id>')
# def home(long, lat, user_id):
#     print("long: " + long)
#     print("lat: " + lat)
#     print("user_id: " + user_id)
#     return "GPS data received"

# if __name__ == '__main__':
#     app.run("0.0.0.0")
import pandas as pd
from flask import Flask, jsonify

app = Flask(__name__)

# Global variables to store interval and destination
INTERVAL = 5
destination = {"latitude": None, "longitude": None}

@app.route('/set_gps_interval/<time>', methods=['GET'])
def set_interval(time):
    """
    Set the GPS interval time.
    Example: /set_gps_interval/10
    """
    global INTERVAL
    try:
        INTERVAL = int(time)  # Convert to integer
        print("set_gps_interval to " + str(INTERVAL))
        return jsonify({"interval": INTERVAL})
    except ValueError:
        return jsonify({"error": "Invalid time value"}), 400

@app.route('/get-interval', methods=['GET'])
def get_interval():
    """
    Get the current GPS interval time.
    """
    global INTERVAL
    return jsonify({"interval": INTERVAL})

@app.route('/set-destination/<float:longitude>/<float:latitude>', methods=['GET'])
def set_destination(longitude, latitude):
    """
    Set the destination GPS coordinates.
    Example: /set-destination/-122.4194/37.7749
    """
    global destination
    destination["latitude"] = latitude
    destination["longitude"] = longitude
    print("Destination set:", destination)
    return jsonify({"message": "Destination set successfully", "destination": destination}), 200

@app.route('/get-destination', methods=['GET'])
def get_destination():
    """
    Get the current destination.
    """
    if destination["latitude"] is not None and destination["longitude"] is not None:
        return jsonify({"destination": destination}), 200
    else:
        return jsonify({"error": "No destination set"}), 404

@app.route('/<float:long>/<float:lat>/<user_id>', methods=['GET'])
def home(long, lat, user_id):
    """
    Receive and process GPS data.
    """
    print("long: " + str(long))
    print("lat: " + str(lat))
    print("user_id: " + user_id)
    return "GPS data received"

if __name__ == '__main__':
    app.run("0.0.0.0", port=5000)

from flask import Flask, send_file, jsonify, redirect
import subprocess
from compare_results import aggregate_and_structure_data
import json
# Create a Flask app
app = Flask(__name__)

# Define a route
@app.route('/')
def main():
    return redirect("home")

@app.route('/dataset')
def get_dataset():
    try:
        result = subprocess.check_output(['python', 'plugin/plugin.py']).decode('utf-8')
        return jsonify({'output': result})
    except subprocess.CalledProcessError as e:
        return jsonify({'error': str(e)})
    
@app.route('/compare-res')
def get_compare_results():
    res = aggregate_and_structure_data('reviews/.')
    return jsonify(res)

@app.route('/res/<path:filename>')
def get_plugin_res(filename):
    return send_file(f'plugin/res/{filename}')

# route that returns a frontend file
@app.route('/<path:filename>')
def get(filename):
    print(f'filepath {filename}')
    return send_file(f'frontend/{filename}')

@app.route("/review")
def go_to_review():
    return send_file('frontend/pages/review.html')

@app.route("/compare")
def go_to_compare():
    return send_file('frontend/pages/compare.html')

@app.route("/home")
def go_to_home():
    return send_file('frontend/pages/home.html')

# Run the app
if __name__ == '__main__':
    app.run(debug=True)

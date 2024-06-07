from flask import Flask, send_file, jsonify, render_template
import subprocess

# Create a Flask app
app = Flask(__name__)

# Define a route
@app.route('/')
def main():
    return send_file('../frontend/index.html')

@app.route('/execute_writer')
def execute_writer():
    try:
        result = subprocess.check_output(['python', '../plugin/plugin.py']).decode('utf-8')
        return jsonify({'output': result})
    except subprocess.CalledProcessError as e:
        return jsonify({'error': str(e)})

# route that returns a frontend file
@app.route('/<path:filename>')
def get(filename):
    print(f'filepath {filename}')
    return send_file(f'../frontend/{filename}')


# Run the app
if __name__ == '__main__':
    app.run(debug=True)

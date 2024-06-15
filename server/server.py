from flask import Flask, send_file, jsonify, redirect, request, make_response
# Create a Flask app
app = Flask(__name__)

# define routes
@app.route('/')
def main():
    return redirect("home")

# pages
@app.route("/username/", defaults={'username': None})
@app.route("/username/<username>")
def go_to_username(username):
    return send_file('../frontend/pages/username.html')  

@app.route("/review/", defaults={'username': None})
@app.route("/review/<username>")
def go_to_review_username(username):
    index = request.args.get("index")
    if index is None:
        index = 1
    if(username is None):
        return redirect('/username/')
    return send_file('../frontend/pages/review.html')

@app.route("/review")
def go_to_review():
    return redirect('/username/')

@app.route("/compare")
def go_to_compare():
    return send_file('../frontend/pages/compare.html')

@app.route("/home")
def go_to_home():
    return send_file('../frontend/pages/home.html')

# resources
# route that returns a frontend file
@app.route('/<path:filename>')
def get(filename):
    print(f'filepath {filename}')
    return send_file(f'../frontend/{filename}')
# returns a res file (plugins)
@app.route('/res/<path:filename>')
def get_plugin_res(filename):
    return send_file(f'../plugin/res/{filename}')

# dataset

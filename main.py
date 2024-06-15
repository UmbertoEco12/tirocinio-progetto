from flask import jsonify, request, make_response
from server.compare_results import aggregate_and_structure_data
from server.database import Database, Answer
from server.server import app
from server.datset import Dataset


db : None | Database = None
dataset : None | Dataset = None 

@app.route('/dataset/<user>/<index>')
def get_data_at(user, index):
    try:
        index = int(index) - 1
        data = dataset.get_data_at(index, user)
        answered_steps = dataset.get_answered_indices(user)
        return jsonify({'dataset':dataset.name,
                        'labels': data.labels, 
                        'data': {
                            'title' : data.title,
                            'content' : data.content,
                            'answer' : data.answer
                        },
                        'count' : dataset.get_data_count(),
                        'answers': answered_steps})        
    except ValueError:
        return jsonify(None)

@app.route('/dataset/<user>', methods=['POST'])
def save_dataset_label( user):
    req= request.get_json()
    db.insert_or_update_value(Answer(user,dataset.name, req["title"], req["label"]))
    return make_response('', 200)

@app.route('/compare-res')
def get_compare_results():
    res = aggregate_and_structure_data('reviews/.')
    return jsonify(res)

@app.route('/download/dataset/<user>')
def download_datset(user):
    res = {}    
    res["user"] = user
    res["dataset"] = dataset.name
    answers = []
    for title, label in db.get_answers(user, dataset.name):
        if label != None:
            answers.append({
                "title" : title,
                'label' : label})
    res["answers"] = answers
    print(res)
    return jsonify(res)

def run():
    global db, dataset
    db = Database()
    dataset = Dataset(db)
    dataset.update()
    # save_dataset()
    app.run(debug=True)

# Run the app
if __name__ == '__main__':
    run()

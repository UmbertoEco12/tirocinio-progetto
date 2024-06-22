from flask import jsonify, request, make_response
from server.compare_results import aggregate_and_structure_data, get_dataset_results
from server.database import Database, Answer, FixedAnswer
from server.server import app
from server.dataset import Dataset


db : None | Database = None
dataset : None | Dataset = None 

@app.route('/dataset/<user>/<index>')
def get_data_at(user, index):
    try:
        index = int(index) - 1
        data = dataset.get_user_data_at(index, user)
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

@app.route("/compare/<index>/json")
def get_compare_at_json(index):
    try:
        index = int(index) - 1
        if index < 0 :
            return jsonify(None)

        data = dataset.get_data_at(index)
        res = get_dataset_results('reviews/.', dataset.name)
        answers = {}
        for r in res:
            answers[r['user']] = None
            for a in r['answers']:
                if a['title'] == data.title:
                    answers[r['user']] = a['label']
                    break
        fixed_answer = db.get_fixed_answer(dataset.name, data.title)
        return jsonify({'dataset':dataset.name,
                        'labels': data.labels, 
                        'data': {
                            'title' : data.title,
                            'content' : data.content
                        },
                        'answers': answers,
                        'fix': fixed_answer})
    except ValueError:
        return jsonify(None)


@app.route('/dataset/answers/<user>')
def get_answers(user):
    answered_steps = dataset.get_answered_indices(user)
    return jsonify({
        'answers' : answered_steps,
        'count' : dataset.get_data_count()
    })

@app.route('/dataset/<user>', methods=['POST'])
def save_dataset_label( user):
    req= request.get_json()
    db.insert_or_update_answer(Answer(user,dataset.name, req["title"], req["label"]))
    return make_response('', 200)

@app.route('/dataset/fix', methods=['POST'])
def save_dataset_fix():
    req = request.get_json()
    db.insert_or_update_fixed_answer(FixedAnswer(dataset.name, req["title"], req["label"]))
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
    data = dataset.get_titles_and_labels()
    # return null if the dataset requires all the answer answered
    # and if the answers len is different to all the answers len
    if (not dataset.allow_blank_labels) and data.__len__() != answers.__len__():
        print("")
        return jsonify(None)

    res["answers"] = answers
    print(res)
    return jsonify(res)

@app.route('/dataset/results')
def get_results():
    res = get_dataset_results('reviews/.', dataset.name)
    data = dataset.get_titles_and_labels()
    fixes = db.get_fixes(dataset.name)
    return jsonify({
        'data' : data,
        'fixes' : fixes,
        'answers':res,
        'dataset': dataset.name})

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

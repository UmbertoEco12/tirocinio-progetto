import subprocess
import json

from server.database import Database, Answer

class Data:
    def __init__(self, dataset: str, labels: list, title: str, content: str, answer: str):
        self.dataset = dataset
        self.labels = labels
        self.title = title
        self.content = content
        self.answer = answer

class Dataset:
    def __init__(self, database: Database):
        self.datset = []
        self.labels = []
        self.name = ""
        self.db = database

    def get_user_data_at(self, index: int, user: str):
        if index < 0 or index > self.dataset.__len__() - 1:
            return None
        # get data at index
        data = self.dataset[index]
        # get the labels associated with this data
        labels = self.labels[int(data["label"])]
        answers = self.db.get_answers(user, self.name)
        answer = None
        for title, label in answers:
            if title == data['title']:
                answer = label
                break
        return Data(self.name, labels, data['title'], data['content'], answer)
    
    def get_data_at(self, index: int):
        if index < 0 or index > self.dataset.__len__() - 1:
            return None
        # get data at index
        data = self.dataset[index]
        # get the labels associated with this data
        labels = self.labels[int(data["label"])]
        return Data(self.name, labels, data['title'], data['content'], None)
    
    def get_answered_indices(self, user: str):
        answers = self.db.get_answers(user, self.name)
        answered_steps = []
        for title, label in answers:
            # get the title index
            i = 0
            if label is None:
                continue
            for data in self.dataset:
                if data["title"] == title:
                    
                    answered_steps.append(i + 1)
                    break
                i = i + 1
        return answered_steps

    def get_data_count(self):
        return self.dataset.__len__()

    def update(self):
        self.labels.clear()
        self.datset.clear()
        try:
            result = subprocess.check_output(['python', 'plugin/plugin.py']).decode('utf-8')
            json_obj = json.loads(result)
            
            for label in json_obj["labels"]:
                self.labels.insert(int(label['name']) + 1,label["labels"])
            self.dataset = json_obj["dataset"]
            self.name = json_obj["name"]
            # print(self.dataset)
            return True
        except subprocess.CalledProcessError as e:
            return False
    def get_titles_and_labels(self):
        res = []
        for data in self.dataset:            
            # get the labels associated with this data
            labels = self.labels[int(data["label"])]
            res.append({
                'title' : data['title'],
                'labels' : labels
            })
        return res
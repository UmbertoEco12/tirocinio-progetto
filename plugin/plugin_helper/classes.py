import json

current_name = 0

class LabelGroup :
    def __init__(self) -> None:
        global current_name
        self.labels = []
        self.name = current_name
        current_name = current_name + 1
        pass
    
    def add_label(self, label : str) :
        self.labels.append(label)
        return self

    def get_labels(self) -> list :
        return {
            "labels": self.labels,
            "name": self.name
        }

class HtmlDataView:
    def __init__(self) -> None:
        self.content = ""
    def set_title(self, title: str) :
        self.title = title
        return self
    def add_data(self, html_content) :
        self.content += (html_content)
        return self
    def add_external_html(self, source_path:str):
        # add main path:
        source_path = '../plugin/'+ source_path
        try:
            with open(source_path, 'r') as file:
                content = file.read()
                self.content += ('\n' + content + '\n')
            return self
        except Exception as e:
            self.content += (f'\nError loading {source_path}, {e}\n')
            return self
    
    def add_text(self, text: str):
        self.content += (f"<p> {text} </p>")
        return self
    def add_img(self, source: str):
        self.content += (f'<img src="{source}" width="500">')
        return self

class DataSet :
    def __init__(self) -> None:
        self.labels = []
        self.dataset = []
        pass

    def add_labels(self, labels : LabelGroup) :
        self.labels.append( labels.get_labels())
        return self
    
    def add_data(self, data : HtmlDataView, label_group: LabelGroup) :
        self.dataset.append({
            "title" : data.title,
            "content": data.content,
            "label" : label_group.name
            })
        return self

    def build(self) :
        # Send data to js
        d = {
            "labels" : self.labels,
            "dataset" : self.dataset
        }
        json_s = json.dumps(d)
        print(json_s)
        pass
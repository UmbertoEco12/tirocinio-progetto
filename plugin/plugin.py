from plugin_helper.classes import *
import pandas as pd
from csv_html_convert import convert_csv_body_to_html 

import os


def return_github_issues_dataset():
    label1 = LabelGroup()
    label1.add_label("bug").add_label("feature").add_label("question").add_label("documentation")

    label2 = NumberLabelGroup(0, 10)
    dataset = DataSet("github issues")
    dataset.add_labels(label1).add_labels(label2)
    # Load the CSV file
    file_path = 'plugin/100-issue-classification.csv'

    data = HtmlDataView()
    data.set_title('number text')
    data.add_html(f'select a number')
    dataset.add_data(0, data, label2)

    data = pd.read_csv(file_path)
    for index, row in data.iterrows():
        data = HtmlDataView()
        data.set_title(row['title'])
        data.add_html('<link rel="stylesheet" href="/res/styles.css">')
        data.add_html(f'<div> {row['labels']} </div>')
        data.add_html(f'<h3> {row['author_association']} </h3>')
        data.add_html(convert_csv_body_to_html(row['body']))
        dataset.add_data(row['id'], data, label1)

    dataset.build()

def return_road_signs_dataset():
    label1 = ImageLabelGroup("road-sign-id")
    label2 = NumberLabelGroup(0, 10)

    dataset = DataSet("road signs")
    dataset.add_labels(label1).add_labels(label2)
    # Load the CSV file
    file_path = 'plugin/100-issue-classification.csv'

    folder_path = "plugin/res/road-signs-dataset"

    i = 0
    for filename in os.listdir(folder_path):
        if filename.endswith(".png"):
            file_path = os.path.join('/res/road-signs-dataset', filename)
            data = HtmlDataView()
            title= f"sign-{i}"
            i += 1
            data.set_title(title)
            data.add_img(file_path, "road-sign-id")
            dataset.add_data(title, data, label1)
    data = HtmlDataView()
    title = "video test"
    data.set_title(title)
    data.add_html(' <iframe width="560" height="315" src="https://www.youtube.com/embed/WO2b03Zdu4Q" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>')
    dataset.add_data(title, data, label2)
    dataset.build()

return_road_signs_dataset()
#return_github_issues_dataset()
from plugin_helper.classes import *
import pandas as pd
from csv_html_convert import convert_csv_body_to_html 


label1 = LabelGroup()
label1.add_label("bug").add_label("feature").add_label("question").add_label("documentation")

dataset = DataSet("github issues")
dataset.add_labels(label1)
# Load the CSV file
file_path = 'plugin/100-issue-classification.csv'
data = pd.read_csv(file_path)

for index, row in data.iterrows():
    data = HtmlDataView()
    data.set_title(row['title'])
    data.add_html('<link rel="stylesheet" href="/res/styles.css">')
    data.add_html(f'<div> {row['labels']} </div>')
    data.add_html(f'<h3> {row['author_association']} </h3>')
    data.add_html(convert_csv_body_to_html(row['body']))
    dataset.add_data(row['title'], data, label1)

dataset.build()

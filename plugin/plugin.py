from plugin_helper.classes import *

label1 = LabelGroup()
label1.add_label("answer 1").add_label("answer 2").add_label("answer 3").add_label("answer 4").add_label("answer 5")

label2 = LabelGroup()
label2.add_label("answer 1").add_label("answer 2").add_label("answer 3")

first_data = HtmlDataView()
first_data.set_title("First data").add_external_html('res/data1.html')

second_data = HtmlDataView()
second_data.add_img("/res/placeholder_graph.png").add_external_html('res/data2.html')

dataset = DataSet("dataset 1")
dataset.add_labels(label1)
dataset.add_labels(label2)

for i in range(1, 9):
    dataset.add_data(f'data {i}',HtmlDataView().add_external_html('res/data1.html'), label1)

dataset.add_data("Second data", second_data,  label2)
dataset.build()
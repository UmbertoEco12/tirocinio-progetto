from plugin_helper.classes import *

labels = LabelGroup()
labels.add_label("ok").add_label("not ok").add_label("maybe").add_label("so call me").add_label("maybe, i just")

label2 = LabelGroup()
label2.add_label("ok").add_label("divertiamoci")

first_data = HtmlDataView()
first_data.add_data("""
<h4 style="color:black;">this data is ok</h4>                   
                    <span>data</span>
""").set_title("First data")

second_data = HtmlDataView()
second_data.add_data("""
<h4 style="color:red">this data is not ok</h4>
""").set_title("stuff")

dataset = DataSet()
dataset.add_labels(labels)
dataset.add_labels(label2)
dataset.add_data(first_data, labels).add_data(second_data,  label2).build()
# print(html_content)
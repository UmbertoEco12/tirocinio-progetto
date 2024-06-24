from html import escape
import markdown
import re

def convert_csv_body_to_html(body):
    # Split the data into lines
    lines = body.splitlines()
    
    group = "none"
    group_str = ""
    html_output = ""
    table = "none"
    table_str = ""
    for line in lines :
        if "```" in line:
            if group == "none":                
                group = "start"
            else :
                group = "end"
        if '|' in line and group == "none":
            table = "start"
        else :
            if table != "none":
                table = "end"
        if group == "start":        
            group = "process"

        elif group == "process":
            group_str +=  f'<pre>{escape(line)}</pre>'

        elif group == "end":
            html_output += f"<div class='markdown-code'> {group_str} </div>"

            group = "none"
            group_str = ""
        elif table  == "start":
            table_str += line + '\n'
            pass
        elif table == "end":
            table_html = markdown.markdown(table_str, extensions=['tables'])
            table_html = table_html.replace('<table>','<table class="markdown-table">')
            html_output += table_html
            table == "none"
            table_str = ""
            pass
        else:
            html_output += markdown.markdown(line)
    return f'<div class="csv-content-container">{html_output}</div>'
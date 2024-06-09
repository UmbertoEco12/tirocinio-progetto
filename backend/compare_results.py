import os
import json
from collections import defaultdict

def gather_json_files(folder_path):
    """Gather all JSON files from the specified folder."""
    json_files = [f for f in os.listdir(folder_path) if f.endswith('.json')]
    return json_files

def load_json_file(file_path):
    """Load the content of a JSON file."""
    with open(file_path, 'r') as file:
        return json.load(file)

def aggregate_choices_data(folder_path):
    """Aggregate choices data from all JSON files in the specified folder."""
    json_files = gather_json_files(folder_path)
    choice_answer_counts = defaultdict(lambda: defaultdict(int))

    for json_file in json_files:
        file_path = os.path.join(folder_path, json_file)
        data = load_json_file(file_path)
        
        for choice in data.get('choices', []):
            title = choice.get('title')
            answer = choice.get('answer')
            if title:
                if answer is None:
                    answer = "No answer"
                choice_answer_counts[title][answer] += 1

    return choice_answer_counts

def structure_data(choice_answer_counts):
    """Structure the aggregated data into the desired JSON format."""
    results = []

    for title, answers in choice_answer_counts.items():
        answer_list = [{"label": None if answer == "No answer" else answer, "count": count} for answer, count in answers.items()]
        results.append({"title": title, "answers": answer_list})

    return {"results": results}

def aggregate_and_structure_data(folder_path):
    """Aggregate and structure the data from the specified folder."""
    choice_answer_counts = aggregate_choices_data(folder_path)
    structured_data = structure_data(choice_answer_counts)
    return structured_data

# if __name__ == "__main__":
#     folder_path = '.'  # Change this to the path of your folder
#     structured_data = aggregate_and_structure_data(folder_path)
    
#     # Print the structured data or write it to a file
#     print(json.dumps(structured_data, indent=2))
#     # To write to a file:
#     # with open('output.json', 'w') as outfile:
#     #     json.dump(structured_data, outfile, indent=2)

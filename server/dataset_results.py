import json
import io
import csv
from pathlib import Path
class DataResult:
    def __init__(self, id, label) -> None:
        self.id = id
        self.label = label
    
    def to_dict(self):
        return {
            'id': self.id,
            'label': self.label
        }

class DatasetResults:
    def __init__(self, dataset_name, results) -> None:
        self.dataset_name = dataset_name
        self.results = [result.to_dict() for result in results]
    
    def to_dict(self):
        return {
            'dataset': self.dataset_name,
            'results': self.results
        }

class DatasetDownload:
    def __init__(self, filename: str, string_data: str) -> None:
        self.filename = filename
        self.data = string_data
    def to_dict(self):
        return {
            'filename': self.filename,
            'data': self.data
        }

def results_to_json(results: DatasetResults) -> DatasetDownload:
    return DatasetDownload(f'{results.dataset_name}_results.json', json.dumps(results.to_dict()))

def append_results_to_csv(results: DatasetResults, csv_filepath: str, id_key: str = "id", annotation_key:str = 'annotation_label') -> DatasetDownload:
    # Read the existing CSV file
    with open(csv_filepath, mode='r', newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        fieldnames = reader.fieldnames
        rows = list(reader)

    # Create a dictionary for quick lookup of labels by id
    id_to_label = {str(result['id']): result['label'] for result in results.results}
    print(id_to_label)
    # Add the new column if it doesn't exist
    if annotation_key not in fieldnames:
        fieldnames.append(annotation_key)

    # Update rows with annotation labels
    for row in rows:
        row_id = row[id_key]
        row[annotation_key] = id_to_label.get(str(row_id), '')
        print(row_id,id_to_label.get(str(row_id), '') )

    # Create the new CSV content
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)
    csv_content = output.getvalue()
    output.close()

    # Create the new CSV filename
    new_csv_filename = csv_filepath.replace('.csv', '_annotated.csv')

    # Write the new CSV file to disk
    with open(new_csv_filename, mode='w', newline='', encoding='utf-8') as csvfile:
        csvfile.write(csv_content)

    # Create and return the DatasetDownload instance
    return DatasetDownload(Path(new_csv_filename).stem + ".csv", csv_content)

def download_results_file(results: DatasetResults) -> DatasetDownload:
    return append_results_to_csv(results, "plugin/100-issue-classification.csv", "id")
    # return results_to_json(results)
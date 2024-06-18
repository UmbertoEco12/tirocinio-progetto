import csv

def read_and_save_csv(input_file, output_file, num_rows=100):
    with open(input_file, 'r', newline='', encoding='utf-8') as infile:
        reader = csv.reader(infile)
        header = next(reader)  # Read the header

        rows = [header]  # Start with the header row
        for i, row in enumerate(reader):
            if i >= num_rows:
                break
            rows.append(row)

    with open(output_file, 'w', newline='', encoding='utf-8') as outfile:
        writer = csv.writer(outfile)
        writer.writerows(rows)

if __name__ == "__main__":
    input_file = "C:/Users/Matteo/Downloads/nlbse23-issue-classification-train.csv/nlbse23-issue-classification-train.csv"
    output_file = '10-issue-classification.csv'  # Replace with your desired output CSV file path
    read_and_save_csv(input_file, output_file, 10)

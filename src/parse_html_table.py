import re
from html.parser import HTMLParser

class TableParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_table = False
        self.in_tr = False
        self.in_cell = False
        self.tables = []
        self.current_table = []
        self.current_row = []
        self.current_cell = []

    def handle_starttag(self, tag, attrs):
        if tag == 'table':
            self.in_table = True
            self.current_table = []
        elif tag == 'tr':
            self.in_tr = True
            self.current_row = []
        elif tag in ('td', 'th'):
            self.in_cell = True
            self.current_cell = []

    def handle_endtag(self, tag):
        if tag == 'table':
            self.in_table = False
            self.tables.append(self.current_table)
        elif tag == 'tr':
            self.in_tr = False
            self.current_table.append(self.current_row)
        elif tag in ('td', 'th'):
            self.in_cell = False
            cell_text = "".join(self.current_cell).strip()
            self.current_row.append(cell_text)

    def handle_data(self, data):
        if self.in_cell:
            self.current_cell.append(data)

def parse_html_table(html_path):
    print("--------------------------------------------------")
    print(f"Parsing {html_path}")
    with open(html_path, "r", encoding="utf-8", errors="ignore") as f:
        html_content = f.read()
    
    parser = TableParser()
    parser.feed(html_content)
    print(f"Found {len(parser.tables)} tables.")
    
    for i, table in enumerate(parser.tables):
        print(f"Table {i} has {len(table)} rows.")
        for idx, row in enumerate(table[:25]):
            print(f"  Row {idx}: {row[:10]}")

parse_html_table("/Users/ftniloy/Downloads/Faculty Desk Finder/faculty-desk-finder/src/extracted_archive1/main_sheet.html")
parse_html_table("/Users/ftniloy/Downloads/Faculty Desk Finder/faculty-desk-finder/src/extracted_archive2/main_sheet.html")

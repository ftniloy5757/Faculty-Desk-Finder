import re

html_path = "/Users/ftniloy/Downloads/Faculty Desk Finder/[Student] CSE Faculty_Staff Contact & Room List - Google Drive_files/sheet.html"

with open(html_path, "r", encoding="utf-8") as f:
    html = f.read()

# Extract column widths
col_widths = []
for m in re.finditer(r'<th[^>]*id="[^"]*C\d+"[^>]*style="[^"]*width:\s*(\d+)px', html):
    col_widths.append(int(m.group(1)))

# Extract row heights
row_heights = []
for m in re.finditer(r'<tr[^>]*style="[^"]*height:\s*(\d+)px', html):
    row_heights.append(int(m.group(1)))

tbody_match = re.search(r'<tbody>(.*?)</tbody>', html, re.DOTALL)
if not tbody_match:
    print("No tbody found")
    exit(1)

tbody_html = tbody_match.group(1)
rows_html = re.split(r'<tr[^>]*>', tbody_html)[1:]

num_rows = len(row_heights)
num_cols = len(col_widths)
grid_map = [[None for _ in range(num_cols)] for _ in range(num_rows)]

def get_next_col(r, start_c):
    c = start_c
    while c < num_cols and grid_map[r][c] is not None:
        c += 1
    return c

for r_idx, r_html in enumerate(rows_html):
    td_matches = re.finditer(r'<td[^>]*>(.*?)</td>', r_html, re.DOTALL)
    curr_col = 0
    for td_match in td_matches:
        td_inner = td_match.group(1)
        td_tag = html[td_match.start() : td_match.end()]
        
        rowspan = 1
        rowspan_m = re.search(r'rowspan="(\d+)"', td_tag)
        if rowspan_m:
            rowspan = int(rowspan_m.group(1))
            
        colspan = 1
        colspan_m = re.search(r'colspan="(\d+)"', td_tag)
        if colspan_m:
            colspan = int(colspan_m.group(1))
            
        curr_col = get_next_col(r_idx, curr_col)
        if curr_col >= num_cols:
            break
            
        text = re.sub(r'<[^>]*>', ' ', td_inner).strip()
        text = " ".join(text.split())
        
        cell_info = {
            "text": text,
            "row": r_idx,
            "col": curr_col,
            "colspan": colspan,
            "rowspan": rowspan,
            "class": re.search(r'class="([^"]*)"', td_tag).group(1) if re.search(r'class="([^"]*)"', td_tag) else ""
        }
        
        for dr in range(rowspan):
            for dc in range(colspan):
                if r_idx + dr < num_rows and curr_col + dc < num_cols:
                    grid_map[r_idx + dr][curr_col + dc] = cell_info
                    
        curr_col += colspan

x_offsets = []
curr_x = 0
for w in col_widths:
    x_offsets.append(curr_x)
    curr_x += w

y_offsets = []
curr_y = 0
for h in row_heights:
    y_offsets.append(curr_y)
    curr_y += h

found_desks = {}
for r in range(num_rows):
    for c in range(num_cols):
        cell = grid_map[r][c]
        if cell and cell["row"] == r and cell["col"] == c:
            text = cell["text"]
            # match desk patterns like 4M107, 4N143, 4K78, 4J60, 4P194, 4G08, 4G15
            match = re.match(r'^(4[M|N|K|L|J|P|G]\d+)', text)
            if match:
                desk_id = match.group(1)
                if desk_id not in found_desks:
                    x_sheet = x_offsets[c]
                    y_sheet = y_offsets[r]
                    w_sheet = sum(col_widths[c : c + cell["colspan"]])
                    h_sheet = sum(row_heights[r : r + cell["rowspan"]])
                    found_desks[desk_id] = (x_sheet, y_sheet, w_sheet, h_sheet, cell["class"])

# Print check
for d in ["4M107", "4M116", "4M125", "4M134", "4M99", "4M126", "4K78"]:
    if d in found_desks:
        x_s, y_s, w_s, h_s, cls = found_desks[d]
        # Let's test the formula:
        x_img = x_s * 2.37 + 865
        y_img = y_s * 2.226 - 1
        w_img = w_s * 2.37
        h_img = h_s * 2.226
        print(f"Desk {d}: Sheet(x={x_s}, y={y_s}, w={w_s}, h={h_s}) -> Img(x={x_img:.1f}, y={y_img:.1f}, w={w_img:.1f}, h={h_img:.1f})")

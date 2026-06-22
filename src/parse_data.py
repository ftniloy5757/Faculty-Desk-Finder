import re
import json
import os
from html.parser import HTMLParser

# Let's define the HTML parser to extract the directory rows from extracted_archive2/main_sheet.html
class DirectoryParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_table = False
        self.in_tr = False
        self.in_cell = False
        self.rows = []
        self.current_row = []
        self.current_cell = []

    def handle_starttag(self, tag, attrs):
        if tag == 'table':
            self.in_table = True
        elif tag == 'tr':
            self.in_tr = True
            self.current_row = []
        elif tag in ('td', 'th'):
            self.in_cell = True
            self.current_cell = []

    def handle_endtag(self, tag):
        if tag == 'table':
            self.in_table = False
        elif tag == 'tr':
            self.in_tr = False
            self.rows.append(self.current_row)
        elif tag in ('td', 'th'):
            self.in_cell = False
            cell_text = "".join(self.current_cell).strip()
            self.current_row.append(cell_text)

    def handle_data(self, data):
        if self.in_cell:
            self.current_cell.append(data)

# Load desk coordinates from SeatMap.tsx
seat_map_path = "/Users/ftniloy/Downloads/Faculty Desk Finder/faculty-desk-finder/src/components/SeatMap.tsx"
with open(seat_map_path, "r", encoding="utf-8") as f:
    seat_map_content = f.read()

# Extract the DESK_OVERLAYS list using regex
overlay_matches = re.findall(r'\{\s*id:\s*"([^"]+)",\s*x:\s*(\d+),\s*y:\s*(\d+),\s*w:\s*(\d+),\s*h:\s*(\d+),\s*zone:\s*"([^"]+)"\s*\}', seat_map_content)

desk_coords = {}
for match in overlay_matches:
    desk_id, x, y, w, h, zone = match
    desk_coords[desk_id] = {
        "x": int(x),
        "y": int(y),
        "w": int(w),
        "h": int(h),
        "zone": zone
    }

print(f"Extracted {len(desk_coords)} desk coordinates from SeatMap.tsx.")

# Parse the directory sheet
dir_sheet_path = "/Users/ftniloy/Downloads/Faculty Desk Finder/faculty-desk-finder/src/extracted_archive2/main_sheet.html"
parser = DirectoryParser()
with open(dir_sheet_path, "r", encoding="utf-8", errors="ignore") as f:
    parser.feed(f.read())

print(f"Parsed {len(parser.rows)} rows from directory HTML.")

# Filter out rows that represent directory records
# The headers are: Initial, Faculty name, Designation, Status, Room, Email
# Row 2 (index 2) had the headers. Data rows start after that and usually have a number in index 0.
faculty_list = []
for idx, r in enumerate(parser.rows):
    if len(r) < 7:
        continue
    # Let's check if the first cell is a number
    num_str = r[0]
    if not num_str.isdigit():
        continue
    
    initial = r[1].strip()
    name = r[2].strip()
    position = r[3].strip()
    status = r[4].strip()
    desk_id = r[5].strip()
    email = r[6].strip()
    
    if not initial or initial.lower() == "initial":
        continue
        
    faculty_list.append({
        "initial": initial,
        "name": name,
        "position": position,
        "status": status,
        "deskId": desk_id,
        "email": email
    })

print(f"Extracted {len(faculty_list)} faculty members from directory.")

# Now combine the coordinates and compute boundingBox as percentages
# Image dimensions: width=4095, height=2487
MAP_WIDTH = 4095.0
MAP_HEIGHT = 2487.0

combined_data = []
for f in faculty_list:
    desk_id = f["deskId"]
    # Clean up desk ID if needed (e.g. strip whitespace)
    desk_id = desk_id.strip()
    
    # Check if desk_id is in coordinates
    coords = desk_coords.get(desk_id)
    if coords:
        left = f"{(coords['x'] / MAP_WIDTH) * 100:.3f}%"
        top = f"{(coords['y'] / MAP_HEIGHT) * 100:.3f}%"
        width = f"{(coords['w'] / MAP_WIDTH) * 100:.3f}%"
        height = f"{(coords['h'] / MAP_HEIGHT) * 100:.3f}%"
        
        boundingBox = {
            "top": top,
            "left": left,
            "width": width,
            "height": height
        }
        zone = coords["zone"]
    else:
        # Placeholder or empty bounding box if the room is not on the map (e.g. off campus or different floor)
        boundingBox = None
        zone = "4G" # Default
        
    combined_data.append({
        "deskId": desk_id,
        "initial": f["initial"],
        "name": f["name"],
        "position": f["position"],
        "email": f["email"],
        "status": f["status"],
        "zone": zone,
        "sdsLink": f"https://cse.sds.bracu.ac.bd/faculty_list",
        "boundingBox": boundingBox
    })

# Also include rooms from DESK_OVERLAYS that are not associated with any specific person
# e.g. meeting rooms, conference rooms, etc.
# Check what rooms in DESK_OVERLAYS are not in our list
associated_desks = set(f["deskId"] for f in combined_data)
for desk_id, coords in desk_coords.items():
    if desk_id not in associated_desks:
        # Determine name/initial for this room
        # We can look up in the original faculty.json if it exists
        room_name = "Room / Area"
        if desk_id == "4G07":
            room_name = "Main Conference/Meeting Room"
        elif desk_id == "4G27":
            room_name = "Praying Room (M)"
        elif desk_id == "4G31":
            room_name = "Small Conference/Meeting Room"
            
        left = f"{(coords['x'] / MAP_WIDTH) * 100:.3f}%"
        top = f"{(coords['y'] / MAP_HEIGHT) * 100:.3f}%"
        width = f"{(coords['w'] / MAP_WIDTH) * 100:.3f}%"
        height = f"{(coords['h'] / MAP_HEIGHT) * 100:.3f}%"
        
        boundingBox = {
            "top": top,
            "left": left,
            "width": width,
            "height": height
        }
        
        combined_data.append({
            "deskId": desk_id,
            "initial": "",
            "name": room_name,
            "position": "Room",
            "email": "",
            "status": "",
            "zone": coords["zone"],
            "sdsLink": "",
            "boundingBox": boundingBox
        })

# Write to facultyData.json
output_path = "/Users/ftniloy/Downloads/Faculty Desk Finder/faculty-desk-finder/src/data/faculty.json"
with open(output_path, "w", encoding="utf-8") as f_out:
    json.dump(combined_data, f_out, indent=2)

print(f"Successfully generated combined faculty data at {output_path} with {len(combined_data)} entries.")

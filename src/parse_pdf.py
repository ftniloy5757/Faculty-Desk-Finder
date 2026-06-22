import pypdf

reader = pypdf.PdfReader("../Seat Map Better Quality.pdf")
print("Number of pages:", len(reader.pages))

page = reader.pages[0]

# List to hold text elements
text_elements = []

def visitor_body(text, cm, tm, fontDict, fontSize):
    t = text.strip()
    if t:
        text_elements.append({
            "text": t,
            "x": tm[4],
            "y": tm[5],
            "fontSize": fontSize
        })

page.extract_text(visitor_text=visitor_body)

print(f"Total text elements extracted: {len(text_elements)}")
# Print first 50 elements
for elem in text_elements[:100]:
    print(f"{elem['text']}: ({elem['x']:.2f}, {elem['y']:.2f})")

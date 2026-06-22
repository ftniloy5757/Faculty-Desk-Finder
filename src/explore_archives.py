import os
import plistlib
import urllib.parse

def extract_webarchive(archive_path, output_dir):
    os.makedirs(output_dir, exist_ok=True)
    print(f"Extracting {archive_path} to {output_dir}...")
    if not os.path.exists(archive_path):
        print(f"Error: {archive_path} does not exist.")
        return
        
    with open(archive_path, 'rb') as f:
        try:
            data = plistlib.load(f)
            
            # Extract main resource
            main_res = data.get('WebMainResource')
            if main_res:
                url = main_res.get('WebResourceURL', 'main.html')
                mime = main_res.get('WebResourceMIMEType', 'text/html')
                res_data = main_res.get('WebResourceData')
                
                parsed_url = urllib.parse.urlparse(url)
                name = os.path.basename(parsed_url.path) or 'index.html'
                if not name.endswith('.html') and 'html' in mime:
                    name += '.html'
                
                if res_data:
                    out_path = os.path.join(output_dir, "main_" + name)
                    with open(out_path, 'wb') as out_f:
                        out_f.write(res_data)
                    print(f"  Extracted main resource: {out_path} ({mime})")
            
            # Extract subresources
            sub_resources = data.get('WebSubresources', [])
            print(f"  Found {len(sub_resources)} subresources.")
            for idx, sub in enumerate(sub_resources):
                url = sub.get('WebResourceURL', f'sub_{idx}')
                mime = sub.get('WebResourceMIMEType', '')
                res_data = sub.get('WebResourceData')
                
                if not res_data:
                    continue
                    
                parsed_url = urllib.parse.urlparse(url)
                name = os.path.basename(parsed_url.path) or f'sub_{idx}'
                
                # Append extension if missing and known MIME
                if '.' not in name:
                    if 'html' in mime:
                        name += '.html'
                    elif 'javascript' in mime or 'js' in mime:
                        name += '.js'
                    elif 'css' in mime:
                        name += '.css'
                        
                out_path = os.path.join(output_dir, f"{idx}_{name}")
                with open(out_path, 'wb') as out_f:
                    out_f.write(res_data)
                print(f"  Extracted subresource {idx}: {out_path} ({mime}) - {url}")
                
        except Exception as e:
            print(f"Error parsing plist {archive_path}: {e}")

# Try both webarchives
extract_webarchive(
    "/Users/ftniloy/Downloads/Faculty Desk Finder/[Student] CSE Faculty:Staff Contact & Room List - Google Drive.webarchive",
    "/Users/ftniloy/Downloads/Faculty Desk Finder/faculty-desk-finder/src/extracted_archive1"
)
extract_webarchive(
    "/Users/ftniloy/Downloads/Faculty Desk Finder/[Student] CSE Faculty:Staff Contact & Room List - Google Drive 1.webarchive",
    "/Users/ftniloy/Downloads/Faculty Desk Finder/faculty-desk-finder/src/extracted_archive2"
)

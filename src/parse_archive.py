import os
import plistlib
import re

search_dir = "/Users/ftniloy/Downloads/Faculty Desk Finder"
search_term = b"SBB"

for root, dirs, files in os.walk(search_dir):
    for f in files:
        path = os.path.join(root, f)
        if ".git" in path or ".next" in path or "node_modules" in path:
            continue
        try:
            with open(path, "rb") as file_bin:
                content = file_bin.read()
                if search_term in content:
                    print(f"Found search term in file: {path} (size: {len(content)})")
                elif f.endswith(".webarchive"):
                    # Check inside plist WebMainResource and WebSubresources
                    try:
                        file_bin.seek(0)
                        data = plistlib.load(file_bin)
                        # Search main resource
                        main_res = data.get('WebMainResource', {})
                        res_data = main_res.get('WebResourceData', b'')
                        if search_term in res_data:
                            print(f"Found in webarchive main resource: {path} (MIME: {main_res.get('WebResourceMIMEType')})")
                        # Search subresources
                        sub_res = data.get('WebSubresources', [])
                        for idx, sub in enumerate(sub_res):
                            sub_data = sub.get('WebResourceData', b'')
                            if search_term in sub_data:
                                print(f"Found in webarchive subresource {idx}: {path} (URL: {sub.get('WebResourceURL')})")
                    except Exception as ex:
                        print(f"Failed to parse plist {path}: {ex}")
        except Exception as e:
            pass

import struct

def get_jpeg_size(filename):
    with open(filename, 'rb') as f:
        # Check SOI marker
        if f.read(2) != b'\xff\xd8':
            return "Not a JPEG"
        
        while True:
            marker = f.read(2)
            if len(marker) < 2:
                break
            if marker[0] != 0xFF:
                # Find next 0xFF
                while len(marker) > 0 and marker[0] != 0xFF:
                    marker = f.read(1)
                if len(marker) == 0:
                    break
                marker = b'\xff' + f.read(1)
                if len(marker) < 2:
                    break
            
            m_type = marker[1]
            # Standalone markers (no size)
            if m_type in (0xD8, 0xD9, 0x01, 0x00, 0xFF) or (m_type >= 0xD0 and m_type <= 0xD7):
                continue
            
            # Read size
            len_bytes = f.read(2)
            if len(len_bytes) < 2:
                break
            segment_len = struct.unpack('>H', len_bytes)[0]
            
            # Check if this is SOF0 - SOF15 (except SOF4, SOF8, SOF12, etc. which are not SOF markers but let's check common ones)
            # SOF0 = 0xC0, SOF1 = 0xC1, SOF2 = 0xC2, SOF3 = 0xC3, SOF5 = 0xC5, SOF6 = 0xC6, SOF7 = 0xC7, SOF9 = 0xC9, SOFA = 0xCA, SOFB = 0xCB, SOFD = 0xCD, SOFE = 0xCE, SOFF = 0xCF
            if m_type in (0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF):
                precision = ord(f.read(1))
                h, w = struct.unpack('>HH', f.read(4))
                return w, h
            
            # Skip the segment payload
            f.read(segment_len - 2)
            
    return None

print("Seat Map.jpg size:", get_jpeg_size("/Users/ftniloy/Downloads/Faculty Desk Finder/Seat Map.jpg"))
print("Seat Map.png size:", get_jpeg_size("/Users/ftniloy/Downloads/Faculty Desk Finder/Seat Map.png")) # should print Not a JPEG

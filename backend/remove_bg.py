from rembg import remove
from PIL import Image
import sys
from io import BytesIO

input_path = sys.argv[1]
output_path = sys.argv[2]

print(f"Opening {input_path}")
try:
    with open(input_path, 'rb') as i:
        input_data = i.read()
    
    print("Removing background...")
    output_data = remove(input_data)
    
    print(f"Saving to {output_path}")
    with open(output_path, 'wb') as o:
        o.write(output_data)
        
    print("Done!")
except Exception as e:
    print(f"Error: {e}")

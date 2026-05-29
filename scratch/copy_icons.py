import os
import shutil
from PIL import Image

src_dir = r"C:\Users\danii\Desktop\icons"
dst_dir = r"C:\Users\danii\Desktop\STONHUB\public\tokens"

# 1. Copy ETH and USDC
for filename in ["eth.png", "usdc.png"]:
    src_path = os.path.join(src_dir, filename)
    dst_path = os.path.join(dst_dir, filename)
    if os.path.exists(src_path):
        shutil.copy(src_path, dst_path)
        print(f"Copied {filename} successfully.")
    else:
        print(f"Source file {src_path} does not exist.")

# 2. Copy Polygon and make white background transparent
poly_src = os.path.join(src_dir, "Polygon_Icon.svg.png")
poly_dst = os.path.join(dst_dir, "pol.png")

if os.path.exists(poly_src):
    img = Image.open(poly_src).convert("RGBA")
    datas = img.getdata()
    
    new_data = []
    for item in datas:
        # If pixel is white or very close to white, make it transparent
        # Threshold: R > 240, G > 240, B > 240
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            new_data.append((255, 255, 255, 0))  # Transparent
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(poly_dst, "PNG")
    print("Processed and saved Polygon_Icon.svg.png as pol.png with transparency.")
else:
    print(f"Source Polygon file {poly_src} not found.")

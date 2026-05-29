from PIL import Image, ImageDraw
import os

def make_background_transparent(src_path, dst_path):
    if not os.path.exists(src_path):
        print(f"Error: Source file {src_path} does not exist!")
        return False
        
    img = Image.open(src_path).convert("RGBA")
    width, height = img.size
    
    # 1. Check if the image already has a transparent pixel
    has_transparency = False
    for x in range(width):
        for y in range(height):
            if img.getpixel((x, y))[3] < 255:
                has_transparency = True
                break
        if has_transparency:
            break
            
    if has_transparency:
        print("Image already has transparent pixels. Copying directly.")
        img.save(dst_path, "PNG")
        return True
        
    # 2. If it's fully opaque, perform a smart flood-fill from the corners to make the background transparent
    # Base logo is blue/white, and background is typically solid white (255, 255, 255) or solid black (0, 0, 0).
    # We will get the color of the top-left pixel (0, 0) as the background color.
    bg_color = img.getpixel((0, 0))
    print(f"Detected opaque background color: {bg_color}. Running smart flood fill...")
    
    # Create a mask of the background color
    mask = Image.new("L", (width, height), 0)
    
    # We use PIL's floodfill to find all border-connected background pixels
    # We'll run it from all four corners just to be safe
    corners = [(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)]
    for corner in corners:
        # Check if the corner is close to the background color
        color = img.getpixel(corner)
        # Tolerance check
        diff = sum(abs(c1 - c2) for c1, c2 in zip(color[:3], bg_color[:3]))
        if diff < 30: # Tolerant color matching
            ImageDraw.floodfill(img, corner, (0, 0, 0, 0), thresh=30)
            
    # Save the processed transparent image
    img.save(dst_path, "PNG")
    print("Background made transparent successfully and saved to", dst_path)
    return True

def main():
    src = r"c:\Users\danii\Desktop\icons\base.png"
    dst = r"c:\Users\danii\Desktop\STONHUB\public\base.png"
    make_background_transparent(src, dst)

if __name__ == "__main__":
    main()

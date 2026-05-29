import urllib.request
import shutil
import os

def main():
    public_dir = r"c:\Users\danii\Desktop\STONHUB\public"
    
    # 1. Copy TON icon
    src_ton = os.path.join(public_dir, "tokens", "ton.png")
    dst_ton = os.path.join(public_dir, "ton.png")
    if os.path.exists(src_ton):
        shutil.copy2(src_ton, dst_ton)
        print("Copied TON icon successfully!")
        
    # 2. Copy Polygon icon
    src_poly = r"c:\Users\danii\Desktop\icons\Polygon_Icon.svg.png"
    dst_poly = os.path.join(public_dir, "polygon.png")
    if os.path.exists(src_poly):
        shutil.copy2(src_poly, dst_poly)
        print("Copied Polygon icon successfully!")
        
    # 3. Download Base logo from Trust Wallet assets
    base_logo_url = "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/info/logo.png"
    dst_base = os.path.join(public_dir, "base.png")
    
    try:
        req = urllib.request.Request(
            base_logo_url, 
            headers={'User-Agent': 'Mozilla/5.0'}
        )
        with urllib.request.urlopen(req) as response:
            with open(dst_base, 'wb') as out_file:
                out_file.write(response.read())
        print("Downloaded Base network icon successfully from TrustWallet assets!")
    except Exception as e:
        print("Error downloading Base network icon:", e)

if __name__ == "__main__":
    main()

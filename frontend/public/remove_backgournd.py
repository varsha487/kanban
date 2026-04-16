from PIL import Image

sizes = [16, 32, 48, 180, 512]

img = Image.open("favicon-clean-real.ico")

for size in sizes:
    resized = img.resize((size, size), Image.LANCZOS)
    resized.save(f"favicon-{size}.ico")

print("Done generating favicon sizes")
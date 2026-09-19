from PIL import Image

src_path = 'C:/Users/DELL/.gemini/antigravity/brain/35000bc2-822e-4bb1-a45f-2b63fc3e0921/.user_uploaded/media_1789801782569.png'
img = Image.open(src_path)
print('Size:', img.size)

# Let us crop the cutout portrait from media_1789801782569.png
# In image 2, the background around the person is pure white (255, 255, 255).
# The person starts around y=240 to bottom, and x=300 to x=860 in the canvas.
# Let us crop the person with bounding box and save to assets/hero-portrait-cutout.png and assets/hero-portrait-cutout.webp!
w, h = img.size
# Crop the central character
# Let's find the bounding box where the person is
crop_box = (int(w * 0.22), int(h * 0.22), int(w * 0.80), h)
person_crop = img.crop(crop_box)
person_crop.save('d:/website/assets/hero-portrait-cutout.png')
print('Saved hero-portrait-cutout.png, size:', person_crop.size)

# Also let's create a transparent PNG version where white background is made transparent (RGBA)
img_rgba = person_crop.convert('RGBA')
datas = img_rgba.getdata()
new_data = []
for item in datas:
    # If the pixel is near white background (r>245, g>245, b>245)
    if item[0] > 248 and item[1] > 248 and item[2] > 248:
        new_data.append((255, 255, 255, 0))
    else:
        new_data.append(item)
img_rgba.putdata(new_data)
img_rgba.save('d:/website/assets/hero-portrait-transparent.png', 'PNG')
print('Saved transparent portrait cutout!')

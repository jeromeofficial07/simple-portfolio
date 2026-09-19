from PIL import Image, ImageFilter
import numpy as np

src = Image.open('C:/Users/DELL/.gemini/antigravity/brain/35000bc2-822e-4bb1-a45f-2b63fc3e0921/.user_uploaded/media_1789801782569.png').convert('RGB')
w, h = src.size

# In media_1789801782569.png, the text ARPUTHA JEROME is already placed behind the person.
# If we extract just the person from the bottom center:
# The person sits between x=220 to x=800, and y=200 to y=668.
# Notice that behind the hair (around y=200-350), the letters ARPUTHA (outline) and JEROME (solid) are partially visible.
# But wait! We also have the original full-res color portrait media_1789674665695.jpg!
# Let us check media_1789674665695.jpg which has the clean subject without text behind!
orig = Image.open('C:/Users/DELL/.gemini/antigravity/brain/35000bc2-822e-4bb1-a45f-2b63fc3e0921/.user_uploaded/media_1789674665695.jpg').convert('RGB')
print('Original photo size:', orig.size)

# If we convert orig to black and white with high contrast:
# Greyscale + contrast enhancement
from PIL import ImageEnhance
gray = orig.convert('L')
enhancer = ImageEnhance.Contrast(gray)
bw_contrast = enhancer.enhance(1.25)
enhancer_bright = ImageEnhance.Brightness(bw_contrast)
bw_final = enhancer_bright.enhance(1.05)
bw_final.save('d:/website/assets/hero-portrait-bw.jpg', quality=95)
print('Saved high-contrast B&W portrait: assets/hero-portrait-bw.jpg')

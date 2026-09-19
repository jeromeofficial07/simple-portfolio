from PIL import Image
import numpy as np

img = Image.open('C:/Users/DELL/.gemini/antigravity/brain/35000bc2-822e-4bb1-a45f-2b63fc3e0921/.user_uploaded/media_1789801782569.png').convert('RGBA')
arr = np.array(img)

# In media_1789801782569.png, the person is in the center, from x=240 to 800, y=200 to 668
# Let us crop the person area with margin
cropped = arr[180:668, 220:804]

# Let us mask out the background (which is pure white / near white, r>240, g>240, b>240)
# But keep the person (hair, face, suit)
# In the person area: hair is dark, face is skin tones/grayscale (values < 235), suit is black.
r, g, b, a = cropped[:,:,0], cropped[:,:,1], cropped[:,:,2], cropped[:,:,3]

# Create alpha mask: where background is white (>245 in all channels), alpha = 0
is_bg = (r > 242) & (g > 242) & (b > 242)
cropped[is_bg, 3] = 0

out_img = Image.fromarray(cropped)
out_img.save('d:/website/assets/jerome-cutout.png', 'PNG')
print('Successfully saved d:/website/assets/jerome-cutout.png with size:', out_img.size)

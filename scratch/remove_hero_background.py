import cv2
import numpy as np

source = cv2.imread("assets/jerome-blazer-original.jpg", cv2.IMREAD_COLOR)
source = cv2.resize(source, (1400, 789), interpolation=cv2.INTER_AREA)
height, width = source.shape[:2]

# The supplied photograph keeps the subject centered against a pale backdrop.
# GrabCut preserves the portrait's natural outline while removing that backdrop.
mask = np.zeros((height, width), np.uint8)
background_model = np.zeros((1, 65), np.float64)
foreground_model = np.zeros((1, 65), np.float64)
subject_bounds = (int(width * 0.18), 0, int(width * 0.70), height)
cv2.grabCut(source, mask, subject_bounds, background_model, foreground_model, 5, cv2.GC_INIT_WITH_RECT)

alpha = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
alpha = cv2.GaussianBlur(alpha, (0, 0), 1.2)

# Preserve the supplied photograph's natural color and high-resolution detail.
portrait = cv2.cvtColor(source, cv2.COLOR_BGR2BGRA)
portrait[:, :, 3] = alpha
cv2.imwrite("assets/hero-portrait-editorial.png", portrait)

from PIL import Image
from io import BytesIO
import base64
from app import casper

def filter(base64_img, filter_type):
    cas_str = casper.Casper
    ext = base64_img.split(',')[0].split(';')[0].split('/')[-1]
    img = Image.open(BytesIO(base64.b64decode(base64_img[base64_img.index(',')+1:])))
    width, height = img.size

    if filter_type == 'black_and_white':
        for i in range(width):
            for j in range(height):
                pixel = img.getpixel((i,j))
                r, g, b = pixel[0], pixel[1], pixel[2]
                avg = int((r + g + b) / 3)
                img.putpixel((i,j), (avg,avg,avg))
    elif filter_type == 'sepia':
        for i in range(width):
            for j in range(height):
                pixel = img.getpixel((i,j))
                r = (pixel[0] * .393) + (pixel[1] * .769) + (pixel[2] * .11)
                g = (pixel[0] * .349) + (pixel[1] * .686) + (pixel[2] * .168)
                b = (pixel[0] * .272) + (pixel[1] * .534) + (pixel[2] * .131)
                img.putpixel((i,j), (int(r),int(g),int(b)))
    elif filter_type == 'casper':
        casper_img = Image.open(BytesIO(base64.b64decode(cas_str[cas_str.index(',')+1:])))
        casper_img.resize((width/8, height/8))
        img.paste(casper_img, (width*7/8, height*7/8))

    return base64.b64encode(bytearray(img.tobytes())).decode('ascii')
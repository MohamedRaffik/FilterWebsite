from base64 import b64encode, b64decode
from PIL import Image, ImageFilter, ImageOps, ImagePalette
from io import BytesIO
from app import Censor

def make_linear_ramp(white=(255,240,192)):
    ramp = []
    r, g, b = white
    for i in range(255):
        ramp.extend((int(r*i/255), int(g*i/255), int(b*i/255)))
    return ramp


def filter(b64_img, filter_type):
    censor_str = Censor.censor
    meta_data = b64_img[0 : b64_img.index(',')+1]
    img = Image.open(BytesIO(b64decode(b64_img[b64_img.index(',')+1:])))
    width, height = img.size

    if filter_type == 'black_and_white':
        for i in range(width):
            for j in range(height):
                pixel = img.getpixel((i, j))
                r, g, b = pixel[0], pixel[1], pixel[2]
                avg = int((r + g + b) / 3)
                img.putpixel((i, j), (avg, avg, avg))
    elif filter_type == 'sepia':
        sepia = make_linear_ramp()
        img = img.convert("L")
        img.putpalette(sepia)
        img = img.convert("RGB")
        '''for i in range(width):
            for j in range(height):
                pixel = img.getpixel((i, j))
                r = (pixel[0] * .393) + (pixel[1] * .769) + (pixel[2] * .11)
                g = (pixel[0] * .349) + (pixel[1] * .686) + (pixel[2] * .168)
                b = (pixel[0] * .272) + (pixel[1] * .534) + (pixel[2] * .131)
                img.putpixel((i, j), (int(r), int(g), int(b)))'''
    elif filter_type == 'censor':
        img = img.filter(ImageFilter.GaussianBlur(10))
        censor_img = Image.open(BytesIO(b64decode(censor_str[censor_str.index(',')+1:])))
        censor_img = censor_img.resize((width, int(height/5)))
        img.paste(censor_img, (0, int(height*2/5)))

    buffered = BytesIO()
    # meta_data looks something like 'data:image/jpeg;base64,'
    img.save(buffered, format=meta_data[meta_data.index('/')+1 : meta_data.index(';')])
    return meta_data + b64encode(buffered.getvalue()).decode('utf-8')

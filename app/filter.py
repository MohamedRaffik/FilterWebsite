from base64 import b64encode, b64decode
from PIL import Image, ImageFilter, ImageOps, ImagePalette
from io import BytesIO
from app import Censor, Logo


#for use in sepia filtering
def make_linear_ramp(white=(255,240,192)):
    ramp = []
    r, g, b = white
    for i in range(255):
        ramp.extend((int(r*i/255), int(g*i/255), int(b*i/255)))
    return ramp


def filter(b64_img, filter_type):
    censor_str = Censor.censor
    logo_str = Logo.logo
    meta_data = b64_img[0 : b64_img.index(',')+1]
    img = Image.open(BytesIO(b64decode(b64_img[b64_img.index(',')+1:])))
    width, height = img.size

    #applies a black and white filter over the image
    if filter_type == 'black_and_white':
        img = img.convert('L')

    #applies a sepia filter over the image
    elif filter_type == 'sepia':
        sepia = make_linear_ramp()
        img = img.convert('L')
        img.putpalette(sepia)
        img = img.convert('RGB')

    #applies a blur to the image and adds a 'censored' image on top
    elif filter_type == 'censor':
        img = img.filter(ImageFilter.GaussianBlur(10))
        censor_img = Image.open(BytesIO(b64decode(censor_str[censor_str.index(',')+1:])))
        censor_img = censor_img.resize((width, int(height/5)))
        img.paste(censor_img, (0, int(height*2/5)))

    #splits the image and half and shows the mirror image
    elif filter_type == 'mirror':
        for i in range (int (width/2)):
            for j in range (height):
                img.putpixel((i,j), img.getpixel((width - i - 1, j)))

    #rotates image by 180 degrees
    elif filter_type == 'upside_down':
        img = img.rotate(180)

    #flips the image to show the 'opposite' verision 
    elif filter_type == 'flip':
        img = img.transpose(Image.FLIP_LEFT_RIGHT)

    #applies several provided ImageFilter's to make the image seem a forgotten memory
    elif filter_type == 'hazy_remembrance':
        img = img.filter(ImageFilter.CONTOUR)
        img = img.filter(ImageFilter.SHARPEN)
        img = img.filter(ImageFilter.DETAIL)
        img = img.filter(ImageFilter.SMOOTH)
        img = img.filter(ImageFilter.FIND_EDGES)

    #changes the color space from rgb to xyz
    elif filter_type == 'feeling_green':
        mat = (
            0.412453, 0.357580, 0.180423, 0,
            0.212671, 0.715160, 0.072169, 0,
            0.019334, 0.119193, 0.950227, 0 )
        img = img.convert("RGB", mat)

    #applies a jester hat logo on the bottom right corner of the image
    elif filter_type == 'joker_logo':
            logo_img = Image.open(BytesIO(b64decode(logo_str[logo_str.index(',')+1:])))
            position = ((img.width - logo_img.width), (img.height - logo_img.height))
            img.paste(logo_img, position, logo_img)

    #swaps color channels blue and red  
    elif filter_type == 'swap_blue_red':
        r, g, b = img.split()
        img = Image.merge('RGB', (b, g, r))

        
    buffered = BytesIO()
    # meta_data looks something like 'data:image/jpeg;base64,'
    img.save(buffered, format=meta_data[meta_data.index('/')+1 : meta_data.index(';')])
    return meta_data + b64encode(buffered.getvalue()).decode('utf-8')

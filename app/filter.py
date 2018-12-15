from base64 import b64encode, b64decode
from PIL import Image, ImageFilter, ImageOps, ImagePalette, ImageDraw, ImageFont
import textwrap
import random
from random import choice
from io import BytesIO
from app import Censor, Logo


#for use in sepia filtering
def make_linear_ramp(white=(255,240,192)):
    ramp = []
    r, g, b = white
    for i in range(255):
        ramp.extend((int(r*i/255), int(g*i/255), int(b*i/255)))
    return ramp

# Convert a base64 string to an Image object and in addition returns information of the image
def convert_from_b64(b64_img):
    img = Image.open(BytesIO(b64decode(b64_img[b64_img.index(',')+1:])))
    info = Image.open(BytesIO(b64decode(b64_img[b64_img.index(',')+1:]))).info
    return img, info

# Converts the given image into a base64 string
def convert_to_b64(img, meta_data):
    buffered = BytesIO()
    # meta_data looks something like 'data:image/jpeg;base64,'
    img.save(buffered, format=meta_data[meta_data.index('/')+1 : meta_data.index(';')])
    return meta_data + b64encode(buffered.getvalue()).decode('utf-8')

# Filter function for multi frame image formats
def motion_filter(b64_img, filter_type, type_of):
    meta_data = b64_img[:b64_img.index(',')+1]
    gif, info = convert_from_b64(b64_img)
    frames = []
    # Loops throw the frames of the GIF or WEBP and apply the given filter to each frame
    try:
        while 1:
            buffer = BytesIO()
            gif.save(buffer, format='png')
            b64_frame = convert_to_b64(Image.open(buffer).convert('RGB'), "data:image/png;base64,")
            img, img_info = convert_from_b64(filter(b64_frame, filter_type))
            frames.append(img)
            gif.seek(gif.tell()+1)
    except EOFError:
        pass
    # Converts the now edited GIF or WEBP into a base64 string
    buffered = BytesIO()
    if type_of == 'gif':
        frames[0].save(buffered, format='gif', save_all=True, append_images=frames[1:], background=info['background'], version=info['version'],
                       duration=info['duration'], loop=info['loop'], extension=info['extension'])
    elif type_of =='webp':
        frames[0].save(buffered, format='webp', save_all=True, append_images=frames[1:])
    return meta_data + b64encode(buffered.getvalue()).decode('utf-8')

def wrap_text(text, w=30):
    new_text = ""
    new_sentence = ""
    for word in text.split(" "):
        delim = " " if new_sentence != "" else ""
        new_sentence = new_sentence + delim + word
        if len(new_sentence) > w:
            new_text += "\n" + new_sentence
            new_sentence = ""
    new_text += "\n" + new_sentence
    return new_text


# Filter function for single frame image formats
def filter(b64_img, filter_type):
    censor_str = Censor.censor
    logo_str = Logo.logo
    meta_data = b64_img[0 : b64_img.index(',')+1]
    img, info = convert_from_b64(b64_img)
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

    #rotates image by 90 degrees counter clockwise
    elif filter_type == 'rotate_cc':
        img = img.rotate(90)

    #flips the image to show the 'opposite' verision
    elif filter_type == 'flip':
        img = img.transpose(Image.FLIP_LEFT_RIGHT)

    #applies several provided ImageFilter's to make the image seem a forgotten memory
    elif filter_type == 'blocked_out':
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

    #negate the image using ImageOps
    elif filter_type == 'forgotten_memory':
        img = ImageOps.invert(img)

    #apply a black border around the image
    elif filter_type == 'border_black':
        img = ImageOps.expand(img, border = 50, fill = 'black')
        img = img.resize((width, height))

    #apply a gold border around the image
    elif filter_type == 'border_gold':
        img = ImageOps.expand(img, border = 50, fill = '#FFD700')
        img = img.resize((width, height))

    #blurs the perimeter of the image
    elif filter_type == 'border_blur':
        RADIUS = 20    
        perim = 2*RADIUS
        back = Image.new('RGB', (width + perim, height + perim), (255,255,255))
        back.paste(img, (RADIUS, RADIUS))

        mask = Image.new('L', (width + perim, height + perim), 255)
        blck = Image.new('L', (width - perim, height - perim), 0)
        mask.paste(blck, (perim, perim))

        blur = back.filter(ImageFilter.GaussianBlur(RADIUS/2))
        back.paste(blur, mask=mask)
        img = back
        img = img.resize((width, height))

    #add text to image
    elif filter_type == 'quote_it':
        draw = ImageDraw.Draw(img)
        font = ImageFont.truetype('app/Roboto-BoldItalic.ttf', size = 40)
        quotes = "Don't cry because it's over, smile because it happened.",\
                 "Not my circus, not my monkeys.",\
                 "Goals transform a random walk into a chase.",\
                 "WE LOVE TRELLO.",\
                 "Why are you dressed like someone died?",\
                 "Sometime I wonder, why am I here?",\
                 "YOU'RE*",\
                 "Can you get in done by tonight?",\
                 "I love deadlines. I love the whooshing noise they make as they go by."
        quote = random.choice(quotes)
        x, y = font.getsize(quote) 
        color = 'rgb(255,255,255)'  
        quote = textwrap.fill(quote, width=40)
        draw.text(((width-x)/width,(height-y)/2), quote, fill=color, font=font)

    return convert_to_b64(img, meta_data)

# FilterX
FilterX is a simple web application hosted on Heroku ([https://filterx.herokuapp.com](https://filterx.herokuapp.com)).
This application provides you with many filters that you can use on an image of your choice.
Have fun and be creative with our filters!


<center>
  
## Features and Screenshots
| Side by side before and after images | Download and Share to social media |
| :----------------------------------: | :--------------------------------: |
| ![demo](https://github.com/MohamedRaffik/FilterWebsite/blob/master/versions/screenshots/filterx_v3_before_and_after_filter.png) | ![demo](https://github.com/MohamedRaffik/FilterWebsite/blob/master/versions/screenshots/filterx_v3_download_and_share.png) |

| Responsive navigation bar | Tons of filters |
| :-----------------------: | :-------------: |
| ![demo](https://github.com/MohamedRaffik/FilterWebsite/blob/master/versions/screenshots/filterx_v3_nav_bar.png) | ![demo](https://github.com/MohamedRaffik/FilterWebsite/blob/master/versions/screenshots/filterx_v3_multiple_filters.png) |

| Recent Images | Image Galleries |
| :-----------: | :-------------: |
| ![demo](https://github.com/MohamedRaffik/FilterWebsite/blob/master/versions/screenshots/filterx_v3_recent_images.png) | ![demo](https://github.com/MohamedRaffik/FilterWebsite/blob/master/versions/screenshots/filterx_v3_my_galleries.png) |

- Multiple upload methods:
  - File upload
  - URL upload
  - Drag and drop

</center>

## Main Tech/frameworks used
- Flask
- Flask-Mail
- Gunicorn
- Passlib, Bcrypt
- Pillow
- Psycopg2
- Python

### Other technologies used
- IdeaBoardz
- Slack
- Trello

### To run locally:
    1) Download this repo
    2) Type the following commands into a terminal (in the same directory that this file resides in):
       export DATABASE_URL=postgres://sjcsiatwgpcqlp:85c103da013b504690d45b859858ee11f0bd8206eb15fc6884e15aa7fabf65a4@ec2-54-197-234-33.compute-1.amazonaws.com:5432/d7pusuiupekkr0
       export GMAIL_PASSWORD=foobar123
       flask run
    3) Go to http://localhost:5000 in a web browser
    Note: The 'Send Message' functionality won't work because our password isn't foobar123 (*gasp*)

## Design and Approach
Our team designed this application based on the Agile Methodology. We held weekly meetings where we discussed
the different features we wished to implement by the end of the following week. To keep track of our ideas and
progress, we heavily relied on Trello. At the end of each week, our team used IdeaBoardz to re-evaluate how
our sprint went - the good aspects, the bad aspects, and what we could change (to remove the bad aspects).
Our application went through two versions (see below) and as of now, we have V3 hosted on Heroku.

## Version History
#### V3 (December 19, 2018) (Current Version)
- Considerably re-worked UI
- Sign Up / Log In functionality
- Recent Images section
- Image Galleries section
- Contact Us section
- More than 10 filters

#### V2 (November 14, 2018)
- 10 filters
- Multiple upload methods
- Filters re-designed to be more efficient
- Download button and social media integration
- Slightly re-worked UI
![filterx_v2](https://user-images.githubusercontent.com/37593075/49114920-6089d880-f267-11e8-8234-c5b4dd6424c8.png)

#### V1 (October 17, 2018)
- 3 filters
- One upload method
- Very clunky UI
![filterx_v1](https://user-images.githubusercontent.com/37593075/49114893-523bbc80-f267-11e8-880e-429f7401b287.png)

## Contributors
- Hasan Abdullah (Team Leader, Front-end)
- Harneet Multani (Back-end)
- Mohamed Raffik (Back-end)
- Chuk Ho Wu (Front-end)

### Motivation/Inspiration
Required website for a Hunter College elective course, CSCI 39549.

### Contact Us
If you have any questions or concerns, please contact us at [filterx.website@gmail.com](mailto:filterx.website@gmail.com)
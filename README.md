# url-capture

Simple API for taking full website screenshots.

It's a small node.js using a headless webkit browser for screen capturing.
It's open-source and works on a free heroku instance.

## Usage

#####/url2png?url=`http://spotify.com`

Shows you a HTML page with the image captured. You can easily save it to your computer.

[Try it](http://url-capture.herokuapp.com/url2png?url=http://spotify.com)


#####/url2png?type=`json`&url=`http://spotify.com`

If you prefer you can receive responses as JSON. Set the `type`param to `json`.

It returns:

- image *(string)*: The image encoded in base64.
- url *(string)*: The URL captured

[Try it](http://url-capture.herokuapp.com/url2png?type=json&url=http://spotify.com)


#####/url2png?callback=`http://requestb.in/107nead1`&url=`http://spotify.com`

Specify a callback URL and url-capture will POST to it when the image is ready.

GET returns 200 if OK or 500 if there was an error.
POST returns a JSON object with the same attrs than method above.



## Fork it on Github

[https://github.com/vieron/url-capture](https://github.com/vieron/url-capture)


## TO-DO
- Implement xdomain
- bookmarklet to download file as png
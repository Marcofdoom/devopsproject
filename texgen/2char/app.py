#!flask/bin/python
from flask import Flask, jsonify, make_response
import sys
import requests
import random
import string
from random import randint
app = Flask(__name__)

@app.route('/test', methods=['GET'])
def test():
    return "test"

@app.route('/texgen', methods=['GET'])
def randomString(stringLength=2):
    """Generate a random string of fixed length """
    letters = string.ascii_uppercase
    return ''.join(random.choice(letters) for i in range(stringLength))
    letter2 = (randomString() )
    return jsonify(letter2)


@app.route('/anEndpoint')
def make_request():
    return requests.get('http://example.com').content

@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify({'error': 'Not found'}), 404)

if __name__ == '__main__':
     app.run(host='0.0.0.0', port=9017)

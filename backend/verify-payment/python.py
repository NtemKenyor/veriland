# pip install flask requests python-dotenv
# you need to install the packages above to run this code.

from flask import Flask, request, jsonify
import requests
import os
from dotenv import load_dotenv

app = Flask(__name__)

load_dotenv()  # Load environment variables from .env file
FLUTTERWAVE_SECRET_KEY = os.getenv("FLUTTERWAVE_SECRET_KEY")

@app.route('/verify-payment/<transaction_id>', methods=['GET'])
def verify_payment(transaction_id):
    url = f'https://api.flutterwave.com/v3/transactions/{transaction_id}/verify'
    headers = { 'Authorization': f'Bearer {FLUTTERWAVE_SECRET_KEY}' }
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        result = response.json()
        if result['status'] == 'success':
            return jsonify({'message': 'Payment verified successfully!', 'data': result['data']}), 200
    return jsonify({'message': 'Payment verification failed.'}), 400

if __name__ == '__main__':
    app.run(debug=True)

from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import check_password_hash, generate_password_hash
import logging

app = Flask(__name__)
CORS(app)
CORS(app, resources={r"/api/*": {"origins": "http://localhost"}})
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:divya@localhost/maheswari_hardware'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Logging setup
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    item_name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200))
    category = db.Column(db.String(50))
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        logger.debug("Received login request")
        data = request.get_json()
        logger.debug(f"Login data: {data}")
        username = data['username']
        password = data['password']
        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.password, password):
            logger.debug("Login successful for user: %s", username)
            return jsonify({'token': 'some_long_token_string'}), 200
        logger.warning("Invalid credentials for user: %s", username)
        return jsonify({'message': 'Invalid credentials'}), 401
    except Exception as e:
        logger.error("Login error: %s", str(e))
        return jsonify({'error': str(e)}), 500

@app.route('/api/products', methods=['GET'])
def get_products():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or auth_header != 'Bearer some_long_token_string':
            logger.warning("Invalid or missing token")
            return jsonify({'message': 'Invalid or missing token'}), 401
        products = Product.query.all()
        return jsonify([{
            'id': p.id,
            'itemName': p.item_name,
            'description': p.description,
            'category': p.category,
            'quantity': p.quantity,
            'price': p.price
        } for p in products]), 200
    except Exception as e:
        logger.error("Get products error: %s", str(e))
        return jsonify({'error': str(e)}), 500

@app.route('/api/products', methods=['POST'])
def add_product():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or auth_header != 'Bearer some_long_token_string':
            logger.warning("Invalid or missing token")
            return jsonify({'message': 'Invalid or missing token'}), 401
        data = request.get_json()
        product = Product(
            item_name=data['itemName'],
            description=data.get('description'),
            category=data.get('category'),
            quantity=data['quantity'],
            price=data['price']
        )
        db.session.add(product)
        db.session.commit()
        return jsonify({
            'id': product.id,
            'itemName': product.item_name,
            'description': product.description,
            'category': product.category,
            'quantity': product.quantity,
            'price': product.price
        }), 201
    except Exception as e:
        logger.error("Add product error: %s", str(e))
        return jsonify({'error': str(e)}), 500

@app.route('/api/products/<int:id>', methods=['GET'])
def get_product(id):
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or auth_header != 'Bearer some_long_token_string':
            logger.warning("Invalid or missing token")
            return jsonify({'message': 'Invalid or missing token'}), 401
        product = Product.query.get_or_404(id)
        return jsonify({
            'id': product.id,
            'itemName': product.item_name,
            'description': product.description,
            'category': product.category,
            'quantity': product.quantity,
            'price': product.price
        }), 200
    except Exception as e:
        logger.error("Get product error: %s", str(e))
        return jsonify({'error': str(e)}), 500

@app.route('/api/products/<int:id>', methods=['PUT'])
def update_product(id):
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or auth_header != 'Bearer some_long_token_string':
            logger.warning("Invalid or missing token")
            return jsonify({'message': 'Invalid or missing token'}), 401
        data = request.get_json()
        product = Product.query.get_or_404(id)
        product.item_name = data.get('itemName', product.item_name)
        product.description = data.get('description', product.description)
        product.category = data.get('category', product.category)
        product.quantity = data.get('quantity', product.quantity)
        product.price = data.get('price', product.price)
        db.session.commit()
        return jsonify({
            'id': product.id,
            'itemName': product.item_name,
            'description': product.description,
            'category': product.category,
            'quantity': product.quantity,
            'price': product.price
        }), 200
    except Exception as e:
        logger.error("Update product error: %s", str(e))
        return jsonify({'error': str(e)}), 500

@app.route('/api/products/<int:id>', methods=['DELETE'])
def delete_product(id):
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or auth_header != 'Bearer some_long_token_string':
            logger.warning("Invalid or missing token")
            return jsonify({'message': 'Invalid or missing token'}), 401
        product = Product.query.get_or_404(id)
        db.session.delete(product)
        db.session.commit()
        return jsonify({'message': 'Product deleted'}), 200
    except Exception as e:
        logger.error("Delete product error: %s", str(e))
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, host='0.0.0.0')
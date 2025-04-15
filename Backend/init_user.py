from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:divya@localhost/maheswari_hardware'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

with app.app_context():
    # Clear existing users
    db.session.query(User).delete()
    # Create owner user with password '[[store]]'
    owner = User(
        username='owner',
        password=generate_password_hash('[[store]]', method='pbkdf2:sha256')
    )
    db.session.add(owner)
    db.session.commit()
    print("Owner user created: owner/[[store]]")
from setup import db

db.account.create_index("email", unique=True)

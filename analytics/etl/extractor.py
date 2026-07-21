import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load env variables from backend directory for MONGO_URI
backend_env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "backend", ".env")
load_dotenv(backend_env_path)

def get_mongo_client():
    uri = os.environ.get("MONGO_URI")
    if not uri:
        raise ValueError("MONGO_URI not found in environment")
    return MongoClient(uri)

def extract_collection(db, collection_name):
    """
    Extracts all documents from a MongoDB collection, flattening _id to id string.
    """
    collection = db[collection_name]
    cursor = collection.find({})
    
    data = []
    for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        
        # Flatten basic populated object references if any stored as ObjectIds
        for key, value in doc.items():
            if hasattr(value, "generation_time"): # It's an ObjectId
                doc[key] = str(value)
                
        data.append(doc)
        
    return data

def extract_all():
    client = get_mongo_client()
    try:
        db = client.get_default_database()
    except Exception:
        db = client["test"]

    collections_to_extract = [
        "users", "occupancies", "visitors", "complaints", 
        "bills", "payments", "expenses", "bookings", 
        "parkingslots", "vehicles"
    ]
    
    extracted_data = {}
    for col in collections_to_extract:
        extracted_data[col] = extract_collection(db, col)
        
    client.close()
    return extracted_data

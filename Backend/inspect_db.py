
from app.db import db
from pprint import pprint

collections = ["volunteers", "registrations", "events"]

for collection_name in collections:
    print("\n" + "=" * 60)
    print(f"COLLECTION: {collection_name}")
    print("=" * 60)

    collection = db[collection_name]

    print("Total documents:", collection.count_documents({}))

    document = collection.find_one(
        {},
        {
            "password": 0,
            "phone": 0,
            "email": 0
        }
    )

    if document:
        pprint(document)
    else:
        print("No documents found.")
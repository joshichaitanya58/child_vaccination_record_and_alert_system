import mysql.connector
from mysql.connector import Error

def create_connection():
    try:
        connection = mysql.connector.connect(
            host='localhost',           # Usually 'localhost' or '127.0.0.1'
            user='root',                # Default MySQL Workbench user
            password='root123',   # Your MySQL password
            database='child_vaccination_record_system'    # Optional: specific database
        )
        
        if connection.is_connected():
            print("✅ MySQL Workbench se successfully connect ho gaya!")
            return connection
            
    except Error as e:
        print(f"❌ Connection error: {e}")
        return None

# Usage
conn = create_connection()
if conn:
    conn.close()
import pyodbc
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database connection settings
server = os.getenv('DB_SERVER')
database = os.getenv('DB_DATABASE')
username = os.getenv('DB_USER')
password = os.getenv('DB_PASSWORD')

print("Connecting to database...")
print(f"Server: {server}")
print(f"Database: {database}")
print(f"User: {username}")

try:
    # Create connection string
    conn_str = (
        f"DRIVER={{ODBC Driver 17 for SQL Server}};"
        f"SERVER={server};"
        f"DATABASE={database};"
        f"UID={username};"
        f"PWD={password};"
        "TrustServerCertificate=yes;"
    )
    
    # Connect to database
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
    
    print("✅ Connected successfully!")
    
    # Execute query to get roles
    cursor.execute("SELECT * FROM Roles")
    
    # Get column names
    columns = [column[0] for column in cursor.description]
    print(f"\n📋 Columns found: {columns}")
    
    # Fetch all rows
    rows = cursor.fetchall()
    
    print(f"\n✅ Found {len(rows)} roles:")
    print("-" * 50)
    
    # Display the results
    for i, row in enumerate(rows, 1):
        print(f"Role {i}:")
        for col_name, value in zip(columns, row):
            print(f"  {col_name}: {value}")
        print("-" * 30)
    
    # Close connection
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"❌ ERROR: {e}")
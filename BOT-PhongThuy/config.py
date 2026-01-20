import os

# Đường dẫn đến file Key Google (Service Account)
GOOGLE_CREDENTIALS_FILE = 'service_account.json'
SPREADSHEET_ID = '1QSFfWZq7Yuhc7W3qBZr7mML-5Yr95Bn1Z9ql5fJXzz0' 

# Cấu hình thư mục
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_RAW_DIR = os.path.join(BASE_DIR, 'data', 'raw')
DATA_PROCESSED_DIR = os.path.join(BASE_DIR, 'data', 'processed')

os.makedirs(DATA_RAW_DIR, exist_ok=True)
os.makedirs(DATA_PROCESSED_DIR, exist_ok=True)

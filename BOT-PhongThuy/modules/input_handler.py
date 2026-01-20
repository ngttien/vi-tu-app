import json
import uuid
import gspread
import os
from datetime import datetime
# Chú ý: Import SPREADSHEET_ID thay vì NAME
from config import GOOGLE_CREDENTIALS_FILE, SPREADSHEET_ID, DATA_RAW_DIR

def connect_gsheet():
    """Hàm phụ trợ: Kết nối đến Google Sheet bằng ID"""
    try:
        gc = gspread.service_account(filename=GOOGLE_CREDENTIALS_FILE)
        # Sửa ở đây: Dùng open_by_key thay vì open
        sh = gc.open_by_key(SPREADSHEET_ID) 
        return sh.sheet1 
    except Exception as e:
        print(f"[LỖI] Không thể kết nối Google Sheet: {e}")
        return None

def process_new_request(user_input_data):
    """
    Hàm xử lý Luồng 1: Nhận input -> Lưu file -> Đẩy lên Sheet
    """
    req_uuid = str(uuid.uuid4())
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    full_data_to_save = {
        "meta": {
            "uuid": req_uuid,
            "timestamp": timestamp,
            "status": "PENDING"
        },
        "user_data": user_input_data
    }
    
    file_path = os.path.join(DATA_RAW_DIR, f"{req_uuid}.json")
    
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(full_data_to_save, f, ensure_ascii=False, indent=4)
        print(f"[OK] Đã lưu file local: {file_path}")
    except Exception as e:
        print(f"[ERROR] Lỗi lưu file: {e}")
        return False

    sheet = connect_gsheet()
    if sheet:
        row_data = [
            timestamp,
            req_uuid,
            user_input_data.get("full_name", "N/A"),
            user_input_data.get("dob", "N/A"),
            user_input_data.get("email", "N/A"),
            "PENDING"
        ]
        
        try:
            sheet.append_row(row_data)
            print(f"[OK] Đã thêm vào Queue trên Sheet: {req_uuid}")
            return True
        except Exception as e:
            print(f"[ERROR] Lỗi ghi Sheet: {e}")
            return False
    else:
        print("[ERROR] Không kết nối được Sheet để ghi dữ liệu.")
        return False

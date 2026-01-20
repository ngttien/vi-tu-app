import time
import json
import os
import re
import gspread
import pyperclip
from playwright.sync_api import sync_playwright

# --- CẤU HÌNH ---
from config import GOOGLE_CREDENTIALS_FILE, SPREADSHEET_ID, DATA_RAW_DIR, DATA_PROCESSED_DIR, BASE_DIR

GEMINI_URL = "https://gemini.google.com/app"
SESSION_DIR = os.path.join(BASE_DIR, "gemini_web_session") 

def connect_gsheet():
    try:
        gc = gspread.service_account(filename=GOOGLE_CREDENTIALS_FILE)
        return gc.open_by_key(SPREADSHEET_ID).sheet1
    except Exception as e:
        print(f"[LỖI] Kết nối Sheet: {e}")
        return None

def update_status(sheet, row_index, status):
    try: sheet.update_cell(row_index, 6, status)
    except: pass

def clean_json_string(text):
    match = re.search(r"```json\s*(.*?)\s*```", text, re.DOTALL)
    if match: return match.group(1)
    
    start = text.find('{')
    end = text.rfind('}') + 1
    if start != -1 and end != -1: return text[start:end]
    return None

def process_queue_with_gemini():
    print("\n--- LUỒNG 2: GEMINI ALL-IN-ONE (TÀI CHÍNH + TỬ VI + SỐ HỌC) ---")
    print(">> Yêu cầu: Đã mở Chrome Port 9222.")
    
    sheet = connect_gsheet()
    if not sheet: return

    all_rows = sheet.get_all_values()
    pending_tasks = []
    
    for idx, row in enumerate(all_rows):
        if idx == 0: continue 
        if len(row) > 5 and row[5] == "PENDING":
            pending_tasks.append({ "row_index": idx + 1, "uuid": row[1], "name": row[2] })
    
    if not pending_tasks:
        print(">> Hàng đợi trống.")
        return

    print(f">> Tìm thấy {len(pending_tasks)} nhiệm vụ. Kết nối Chrome...")

    try:
        with sync_playwright() as p:
            # Kết nối Chrome
            try:
                browser = p.chromium.connect_over_cdp("http://localhost:9222")
            except:
                print("[CRITICAL] Không kết nối được Chrome. Hãy mở Port 9222!")
                return
                
            context = browser.contexts[0]
            page = None
            for p_item in context.pages:
                if "gemini.google.com" in p_item.url: page = p_item; break
            if not page: page = context.new_page(); page.goto(GEMINI_URL)

            # --- BẮT ĐẦU VÒNG LẶP ---
            for task in pending_tasks:
                uuid_str = task['uuid']
                name = task['name']
                print(f"\n>> [ĐANG XỬ LÝ] {name} (ID: {uuid_str})")
                update_status(sheet, task['row_index'], "PROCESSING")

                raw_path = os.path.join(DATA_RAW_DIR, f"{uuid_str}.json")
                if not os.path.exists(raw_path):
                    update_status(sheet, task['row_index'], "ERROR_FILE"); continue
                with open(raw_path, 'r', encoding='utf-8') as f: user_input = f.read()

                # --- SIÊU PROMPT (A-Z) ---
                # Đây là phần quan trọng nhất: Ép Gemini đóng 3 vai cùng lúc
                PROMPT = f"""
                Bạn là một chuyên gia tư vấn toàn diện: Bậc thầy Tử Vi (Đông phương), Chuyên gia Chiêm tinh (Tây phương), Nhà Thần số học và Cố vấn Tài chính cấp cao.
                
                Dựa trên dữ liệu khách hàng sau:
                {user_input}

                HÃY PHÂN TÍCH VÀ TRẢ VỀ KẾT QUẢ DƯỚI DẠNG JSON THUẦN TÚY (RAW JSON).
                Cấu trúc JSON bắt buộc phải có các trường sau (dùng tiếng Việt cho nội dung):

                {{
                    "thong_tin_co_ban": {{
                        "ho_ten": "{name}",
                        "menh_ngu_hanh": "Ví dụ: Lư Trung Hỏa...",
                        "cung_phi": "Ví dụ: Càn...",
                        "chom_sao": "Ví dụ: Song Tử...",
                        "so_chu_dao": "Tính toán số chủ đạo thần số học từ ngày sinh..."
                    }},
                    "luan_giai_tong_quan": {{
                        "tinh_cach_than_so_hoc": "Phân tích tính cách dựa trên số chủ đạo",
                        "uu_diem": "...",
                        "nhuoc_diem": "..."
                    }},
                    "du_bao_tuong_lai": {{
                        "tai_chinh": "Dự đoán xu hướng tài chính, các cơ hội và rủi ro tiền bạc trong tương lai gần và xa.",
                        "su_nghiep": "Nghề nghiệp phù hợp, đường quan lộ, thăng tiến...",
                        "suc_khoe": "Các vấn đề sức khỏe cần lưu ý theo tạng người và mệnh..."
                    }},
                    "loi_khuyen_chien_luoc": {{
                        "phong_thuy_cai_van": "Màu sắc, hướng, vật phẩm phong thủy nên dùng...",
                        "quan_ly_tai_chinh": "Lời khuyên cụ thể về đầu tư, tiết kiệm...",
                        "phat_trien_ban_than": "Lời khuyên tu dưỡng..."
                    }}
                }}

                YÊU CẦU: 
                1. Nội dung phải sâu sắc, chuyên sâu, mang tính cá nhân hóa cao.
                2. KHÔNG được trả lời bằng markdown, không lời dẫn. CHỈ TRẢ VỀ JSON.
                """

                # --- GỬI VÀ NHẬN KẾT QUẢ ---
                try:
                    # Tìm ô chat
                    chat_box = page.locator("div[role='textbox']")
                    chat_box.wait_for(timeout=10000)
                    chat_box.click()

                    # Gửi prompt
                    pyperclip.copy(PROMPT)
                    time.sleep(0.5)
                    page.keyboard.press("Control+V")
                    time.sleep(1)
                    page.keyboard.press("Enter")
                    print("   -> Đã gửi Siêu Prompt (A-Z)...")

                    # Đợi kết quả (Prompt dài nên đợi lâu hơn chút - 20s)
                    time.sleep(10)
                    last_len = 0
                    stable_count = 0
                    final_json_str = ""
                    
                    for _ in range(120): # Tối đa 2 phút
                        try:
                            el = page.locator("model-response").last
                            curr_text = el.inner_text()
                            if len(curr_text) > last_len:
                                last_len = len(curr_text); stable_count = 0
                            else: stable_count += 1
                            
                            # Đợi ổn định 5 giây và text phải dài (trên 100 ký tự)
                            if stable_count >= 5 and len(curr_text) > 100:
                                final_json_str = clean_json_string(curr_text)
                                break
                        except: pass
                        time.sleep(1)
                    
                    if final_json_str:
                        # Lưu kết quả
                        save_path = os.path.join(DATA_PROCESSED_DIR, f"{uuid_str}_result.json")
                        with open(save_path, 'w', encoding='utf-8') as f:
                            f.write(final_json_str) # Lưu thẳng text đã clean
                            # Hoặc dùng json.dump nếu muốn validate lại:
                            # json_obj = json.loads(final_json_str)
                            # json.dump(json_obj, f, ensure_ascii=False, indent=4)
                        
                        print(f"   [OK] Đã lưu kết quả A-Z.")
                        update_status(sheet, task['row_index'], "DONE")
                    else:
                        print("   [LỖI] Không lấy được JSON.")
                        update_status(sheet, task['row_index'], "ERROR_FORMAT")

                except Exception as e:
                    print(f"   [LỖI] Runtime: {e}")
                    update_status(sheet, task['row_index'], "ERROR_UNKNOWN")

                time.sleep(3)

            print("\n>> HOÀN TẤT TOÀN BỘ.")

    except Exception as e:
        print(f"[CRITICAL] Lỗi: {e}")

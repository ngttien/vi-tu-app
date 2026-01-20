import sys
from modules.input_handler import process_new_request
from modules.gemini_worker import process_queue_with_gemini

def main():
    while True:
        print("\n--- AUTO SYSTEM MENU ---")
        print("1. [Luồng 1] Tạo request giả lập (Input -> JSON -> Sheet)")
        print("2. [Luồng 2] Chạy Gemini Worker (Sheet -> Playwright -> Gemini -> Result)")
        print("3. Thoát")
        choice = input("Chọn chức năng (1-3): ")

        if choice == "1":
            # DATA GIẢ LẬP
            mock_input = {
                "full_name": "Tran Van Test",
                "dob": "1998-12-20",
                "email": "test.automail@gmail.com",
                "finance_data": {
                    "salary": "15 triệu",
                    "saving": "100 triệu",
                    "goal": "Mua nhà"
                }
            }
            process_new_request(mock_input)

        elif choice == "2":
            # LƯU Ý: Tắt trình duyệt Chrome trước khi chạy để tránh xung đột
            process_queue_with_gemini()
            
        elif choice == "3":
            sys.exit()

if __name__ == "__main__":
    main()

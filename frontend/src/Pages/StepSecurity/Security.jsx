import React, { useState, useEffect } from "react";
import "./Security.css";

const Security = ({ formData, onNext, onBack }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State cho Captcha
  const [captchaCode, setCaptchaCode] = useState(""); 
  const [inputCaptcha, setInputCaptcha] = useState(""); 
  const [captchaError, setCaptchaError] = useState(""); 

  // Hàm sinh mã ngẫu nhiên
  const generateCaptcha = () => {
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setCaptchaCode(randomCode);
  };

  // Hàm xử lý khi bấm đổi mã (Reset input và lỗi)
  const handleRefreshCaptcha = () => {
    generateCaptcha();
    setCaptchaError(""); 
    setInputCaptcha(""); 
  };

  // Sinh mã khi Component vừa load
  useEffect(() => {
    generateCaptcha();
  }, []);

  // Hàm xử lý khi bấm nút Xác thực
  const handleSubmit = async () => {
    // 1. Kiểm tra rỗng
    if (!inputCaptcha || inputCaptcha.trim() === "") {
      generateCaptcha();
      setCaptchaError("Vui lòng nhập mã xác thực!");
      return; 
    }

    // 2. Kiểm tra sai mã
    if (inputCaptcha !== captchaCode) {
      generateCaptcha();
      setInputCaptcha(""); 
      setCaptchaError("Mã sai. Đã đổi mã mới!");
      return; 
    }

    // 3. Đúng mã -> Gửi dữ liệu về Server
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:3000/api/user/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        onNext(); 
      } else {
        alert("Lỗi: " + (result.message || "Không thể gửi dữ liệu"));
        generateCaptcha(); 
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi kết nối tới Server cổng 3000!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="step-container">
      {/* Container chính sử dụng class mới */}
      <div className="security-card">
        
        {/* --- PHẦN 1: THÔNG TIN TÓM TẮT --- */}
        <div className="security-title-box">
          <h3 className="security-title">KIỂM TRA THÔNG TIN</h3>
        </div>
        
        {/* Hiển thị thông tin tóm tắt (inline style nhẹ để dễ nhìn trên nền tối) */}
        <div style={{ marginBottom: '25px', color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.6' }}>
          <div><strong>Họ tên:</strong> {formData.fullName || "Chưa nhập"}</div>
          <div><strong>Email:</strong> {formData.email || "Chưa nhập"}</div>
          <div>
             <strong>Chi tiết:</strong> {formData.dob} ({formData.calendarType}) - {formData.tob}
          </div>
        </div>

        {/* --- PHẦN 2: BẢO MẬT --- */}
        <div className="security-title-box">
          <h3 className="security-title">XÁC THỰC BẢO MẬT</h3>
        </div>
        
        <p className="security-note">
          Để đảm bảo an toàn, vui lòng nhập mã xác thực hiển thị bên dưới.
        </p>

        {/* Khu vực hiển thị mã Captcha */}
        <div className="captcha-row">
          <div className="captcha-box">
            <span className="captcha-text">{captchaCode}</span>
            {/* Đường kẻ ngang trang trí (absolute) */}
            <div className="captcha-line"></div>
          </div>
          
          <div 
            style={{ cursor: 'pointer', color: '#94a3b8', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }} 
            onClick={handleRefreshCaptcha}
          >
            ↻ Đổi mã
          </div>
        </div>

        {/* Ô nhập liệu với class mới */}
        <input 
          type="text" 
          className="input-field-security" 
          placeholder="Nhập mã xác thực..." 
          value={inputCaptcha}
          onChange={(e) => {
            setInputCaptcha(e.target.value);
            if(captchaError) setCaptchaError(""); 
          }}
        />
        
        {/* Thông báo lỗi */}
        {captchaError && <div className="error-text">{captchaError}</div>}

        {/* Hàng nút bấm */}
        <div className="btn-row">
          <button 
            className="btn-outline" 
            onClick={onBack} 
            disabled={isSubmitting}
          >
            QUAY LẠI
          </button>

          <button 
            className="btn-solid" 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            style={{ opacity: isSubmitting ? 0.7 : 1 }}
          >
            {isSubmitting ? "ĐANG GỬI..." : "XÁC THỰC"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Security;
import React, { useState, useEffect } from "react";
import "./Security.css";

const Security = ({ formData, onNext, onBack }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // --- GIỮ NGUYÊN TOÀN BỘ STATE CỦA BẠN ---
  const [captchaCode, setCaptchaCode] = useState(""); 
  const [inputCaptcha, setInputCaptcha] = useState(""); 
  const [captchaError, setCaptchaError] = useState(""); 

  // --- GIỮ NGUYÊN HÀM SINH MÃ ---
  const generateCaptcha = () => {
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setCaptchaCode(randomCode);
  };

  // --- GIỮ NGUYÊN HÀM ĐỔI MÃ ---
  const handleRefreshCaptcha = () => {
    generateCaptcha();
    setCaptchaError(""); 
    setInputCaptcha(""); 
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  // --- CHỈ SỬA HÀM NÀY ĐỂ KHÔNG GỌI AI Ở ĐÂY ---
  const handleSubmit = () => {
    if (!inputCaptcha || inputCaptcha.trim() === "") {
      setCaptchaError("Vui lòng nhập mã xác thực!");
      return; 
    }

    if (inputCaptcha !== captchaCode) {
      generateCaptcha();
      setInputCaptcha(""); 
      setCaptchaError("Mã sai. Đã đổi mã mới!");
      return; 
    }

    // ĐÚNG MÃ -> CHUYỂN SANG BƯỚC REVIEW ĐỂ KIỂM TRA LẦN CUỐI
    onNext(); 
  };

  return (
    <div className="step-container">
      <div className="security-card">
        <div className="security-title-box">
          <h3 className="security-title">XÁC THỰC BẢO MẬT</h3>
        </div>
        
        <p className="security-note">
          Để đảm bảo an toàn, vui lòng nhập mã xác thực hiển thị bên dưới.
        </p>

        <div className="captcha-row">
          <div className="captcha-box">
            <span className="captcha-text">{captchaCode}</span>
            <div className="captcha-line"></div>
          </div>
          
          <div 
            style={{ cursor: 'pointer', color: '#94a3b8', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }} 
            onClick={handleRefreshCaptcha}
          >
            ↻ Đổi mã
          </div>
        </div>

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
        
        {captchaError && <div className="error-text">{captchaError}</div>}

        <div className="btn-row">
          <button className="btn-outline" onClick={onBack}>QUAY LẠI</button>
          <button className="btn-solid" onClick={handleSubmit}>XÁC THỰC</button>
        </div>
      </div>
    </div>
  );
};

export default Security;
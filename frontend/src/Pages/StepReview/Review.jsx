import React, { useState } from "react";
import "./Review.css";

const Review = ({ formData, onNext, onBack }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:3000/api/user/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        onNext(); // Chuyển sang StepSuccess (Frame 17)
      } else {
        alert("Lỗi: " + (result.message || "Không thể gửi dữ liệu"));
      }
    } catch ( error ) {
      console.error(error);
      alert("Lỗi kết nối tới Server cổng 3000!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="step-container">
      {/* ĐÃ XÓA: header-section để không bị lặp với MainLayout */}

      <div className="input-card">
        <h3 className="section-title">Kiểm tra thông tin cuối</h3>
        <p className="step-desc">
          Để bản luận giải được gửi chính xác, vui lòng kiểm tra lại thông tin.
        </p>

        <div className="review-box">
          <p className="review-label">HỌ TÊN & MỤC TIÊU</p>
          <p className="review-name">
            {formData.fullName || "Chưa nhập tên"} | Mục tiêu: {formData.goal}
          </p>
          <p className="review-detail">
            NS: {formData.dob} | Giờ: {formData.tob} | {formData.gender === 'male' ? 'Nam' : 'Nữ'}
          </p>
        </div>

        <label className="label">Xác nhận lại Email</label>
        <input 
          type="text" 
          className="input-field readonly-input" 
          value={formData.email} 
          readOnly 
        />

        <button 
          className="btn-primary" 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          style={{ opacity: isSubmitting ? 0.7 : 1 }}
        >
          {isSubmitting ? "ĐANG TÍNH TOÁN..." : "GỬI YÊU CẦU LUẬN GIẢI"}
        </button>

        <button 
          className="btn-link" 
          onClick={onBack} 
          disabled={isSubmitting}
        >
          Quay lại chỉnh sửa
        </button>
      </div>
    </div>
  );
};

export default Review;
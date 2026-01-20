import React, { useState } from 'react';
import './Input.css';

const Input = ({ formData, setFormData, onNext }) => {
  // State lưu trữ lỗi của các trường
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Khi người dùng bắt đầu nhập lại, tự động xóa lỗi của trường đó đi
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleCalendarToggle = (type) => {
    setFormData({ ...formData, calendarType: type });
  };

  // Hàm kiểm tra hợp lệ
  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    // 1. Kiểm tra Họ tên
    if (!formData.fullName || formData.fullName.trim() === '') {
      newErrors.fullName = 'Vui lòng nhập họ và tên';
      isValid = false;
    }

    // 2. Kiểm tra Ngày sinh
    if (!formData.dob) {
      newErrors.dob = 'Vui lòng chọn ngày sinh';
      isValid = false;
    }

    // 3. Kiểm tra Giờ sinh
    if (!formData.tob) {
      newErrors.tob = 'Vui lòng chọn giờ sinh';
      isValid = false;
    }

    // 4. Kiểm tra Email (Bắt buộc & Đúng định dạng)
    if (!formData.email || formData.email.trim() === '') {
      newErrors.email = 'Vui lòng nhập email nhận kết quả';
      isValid = false;
    } else {
      // Regex kiểm tra format email cơ bản
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Email không hợp lệ';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  // Hàm xử lý khi bấm nút Tiếp theo
  const handleSubmit = () => {
    if (validateForm()) {
      onNext(); // Chỉ chuyển trang nếu dữ liệu hợp lệ
    } else {
      // Có thể thêm alert hoặc scroll lên trên nếu cần
      // alert("Vui lòng điền đầy đủ thông tin!");
    }
  };

  return (
    <div className="step-container">
      <div className="input-card">
        <h3 className="section-title">Thông tin cá nhân</h3>

        {/* 1. HỌ TÊN */}
        <label className="label">Họ và tên <span className="required">*</span></label>
        <input 
          type="text" 
          name="fullName"
          className={`input-field ${errors.fullName ? 'input-error' : ''}`} 
          placeholder="Nhập họ và tên..." 
          value={formData.fullName} 
          onChange={handleChange} 
        />
        {errors.fullName && <span className="error-message">{errors.fullName}</span>}

        {/* --- CỤM NÚT LỊCH DƯƠNG/ÂM --- */}
        <div className="calendar-toggle-container">
          <span className="toggle-label">Lịch</span>
          <div className="toggle-box">
            <div 
              className={`toggle-item ${formData.calendarType === 'duong' ? 'active' : ''}`} 
              onClick={() => handleCalendarToggle('duong')}
            >
              DƯƠNG
            </div>
            <div 
              className={`toggle-item ${formData.calendarType === 'am' ? 'active' : ''}`} 
              onClick={() => handleCalendarToggle('am')}
            >
              ÂM
            </div>
          </div>
        </div>

        {/* 2. NGÀY SINH & GIỜ SINH */}
        <div className="row">
          <div className="col">
            <label className="label">Ngày sinh <span className="required">*</span></label>
            <input 
              type="date" 
              name="dob" 
              className={`input-field ${errors.dob ? 'input-error' : ''}`} 
              value={formData.dob} 
              onChange={handleChange} 
            />
            {errors.dob && <span className="error-message">{errors.dob}</span>}
          </div>
          <div className="col">
            <label className="label">Giờ sinh <span className="required">*</span></label>
            <input 
              type="time" 
              name="tob" 
              className={`input-field ${errors.tob ? 'input-error' : ''}`} 
              value={formData.tob} 
              onChange={handleChange} 
            />
            {errors.tob && <span className="error-message">{errors.tob}</span>}
          </div>
        </div>

        {/* 3. GIỚI TÍNH & MỤC TIÊU */}
        <div className="row">
          <div className="col">
            <label className="label">Giới tính</label>
            <select name="gender" className="input-field" value={formData.gender} onChange={handleChange}>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
            </select>
          </div>
          <div className="col">
            <label className="label">Mục tiêu</label>
            <select name="goal" className="input-field" value={formData.goal} onChange={handleChange}>
              <option value="career">Sự nghiệp</option>
              <option value="love">Tình duyên</option>
              <option value="study">Học tập</option>
              <option value="family">Gia đình</option>
              <option value="friend">Bạn bè</option>
            </select>
          </div>
        </div>

        {/* 4. GHI CHÚ & EMAIL */}
        <label className="label">Mô tả thêm mong muốn / hoàn cảnh (Không bắt buộc)</label>
        <textarea 
          name="note" 
          className="input-field textarea-field" 
          placeholder="Ví dụ: Tôi đang muốn chuyển việc..." 
          value={formData.note} 
          onChange={handleChange}
        ></textarea>

        <label className="label">Email nhận kết quả <span className="required">*</span></label>
        <input 
          type="email" 
          name="email" 
          className={`input-field ${errors.email ? 'input-error' : ''}`} 
          placeholder="email@example.com" 
          value={formData.email} 
          onChange={handleChange} 
        />
        {errors.email && <span className="error-message">{errors.email}</span>}

        <button className="btn-primary" onClick={handleSubmit}>TIẾP THEO</button>
      </div>
    </div>
  );
};

export default Input;
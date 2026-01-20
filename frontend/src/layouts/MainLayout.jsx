import React from 'react';
import './MainLayout.css';

const MainLayout = ({ children }) => {
  return (
    <div className="main-layout-wrapper">
      {/* Lớp họa tiết Trống Đồng ẩn phía sau */}
      <div className="mystical-bg-overlay"></div>
      
      <div className="main-container">
        <header className="header-section">
          <h1 className="header-title">THUẬN THỜI HIỂU MỆNH</h1>
          <p className="header-subtitle">Vạn Sự Hanh Thông</p>
          
          <div className="header-divider"></div>
          
          {/* Phần mô tả này giúp giao diện giống hệt Figma */}
          <p className="header-description">
            Khám phá bản đồ vận mệnh cá nhân thông qua sự kết hợp giữa tinh hoa cổ học và trí tuệ nhân tạo. 
            Nhận bản luận giải chi tiết về Đại Vận, Thần Số Học và lộ trình cải mệnh độc bản.
          </p>
        </header>

        <main className="step-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
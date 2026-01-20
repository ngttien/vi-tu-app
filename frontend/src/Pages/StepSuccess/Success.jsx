import React from 'react';
import './Success.css';

const Success = () => {
  return (
    <div className="step-container">
      {/* ĐÃ XÓA: header-section vì đã có trong MainLayout */}

      <div className="success-card">
        <div className="success-icon-wrapper">
          <div className="success-icon">✔</div>
        </div>
        
        <h3 className="success-title">Gửi thông tin thành công!</h3>
        
        <p className="success-message">
          Hệ thống AI đang bắt đầu tính toán và vẽ tranh đại vận cho bạn. 
          <br/><br/>
          Bản luận giải PDF sẽ được gửi vào email của bạn trong ít phút nữa.
        </p>

        <div className="success-quote">
          "Thuận theo thiên ý, hiểu được mệnh mình,<br/>vạn sự ắt sẽ hanh thông"
        </div>
      </div>
    </div>
  );
};

export default Success;
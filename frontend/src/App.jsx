import React, { useState } from 'react';
import './App.css';

// Import Layout chung
import MainLayout from './layouts/MainLayout';

// Import các màn hình
import Input from './Pages/StepInput/Input';
import Security from'./Pages/StepSecurity/Security';
import Review from './Pages/StepReview/Review';
import Success from './Pages/StepSuccess/Success';

function App() {
  // --- 1. QUẢN LÝ STATE ---
  const [step, setStep] = useState(1); 
  const [formData, setFormData] = useState({
    fullName: '',
    calendarType: 'duong',
    dob: '',
    tob: '',
    gender: 'male',
    goal: 'career',
    description:  '',
    email: ''
  });

  // --- 2. CÁC HÀM ĐIỀU HƯỚNG ---
  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  // --- 3. LOGIC CHỌN MÀN HÌNH ---
  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return <Input formData={formData} setFormData={setFormData} onNext={nextStep} />;
      case 2:
        return <Security formData={formData} onNext={nextStep} onBack={prevStep} />;
      case 3:
        return <Review formData={formData} onNext={nextStep} onBack={prevStep} />;
      case 4:
        return <Success />; 
      default:
        return <Input formData={formData} setFormData={setFormData} onNext={nextStep} />;
    }
  };

  // --- 4. GIAO DIỆN CHÍNH ---
  return (
    <div className="app-container">
      {/* Bọc MainLayout ở đây để hình nền ngua_bg.jpg lộ diện */}
      <MainLayout>
        <div className="mobile-wrapper">
          {renderCurrentStep()}
        </div>
      </MainLayout>
    </div>
  );
}

export default App;
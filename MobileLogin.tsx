/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, Shield, Phone, Mail } from 'lucide-react';
import { SystemUser } from '../types';

interface MobileLoginProps {
  onLoginSuccess: (user: SystemUser) => void;
  onNavigateToSso: () => void;
}

export default function MobileLogin({ onLoginSuccess, onNavigateToSso }: MobileLoginProps) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    // Accept custom credentials or predefined accounts
    if (username.toLowerCase() === 'admin') {
      onLoginSuccess({
        username: 'admin',
        fullName: 'Dương Văn Hà',
        role: 'admin'
      });
    } else {
      onLoginSuccess({
        username: username,
        fullName: 'Cán Bộ Thôn Tân An',
        role: 'officer'
      });
    }
  };

  return (
    <div id="mobile-login-screen" className="relative flex flex-col min-h-screen bg-[#F4F9F5] text-[#2C3E50] font-sans overflow-y-auto pb-8">
      
      {/* 1. Phần đầu trang - Art background and Logo exactly like user prompt */}
      <div className="relative w-full pt-8 pb-4 px-6 flex flex-col items-center">
        
        {/* Background Hills and Clouds in SVG - matching the illustration provided */}
        <div className="absolute top-0 left-0 w-full h-[320px] pointer-events-none overflow-hidden z-0 select-none">
          <svg viewBox="0 0 500 320" fill="none" className="w-full h-full object-cover opacity-90 transition-all">
            {/* Soft sky and distant city layers */}
            <rect width="500" height="320" fill="url(#skyGradient)" />
            <path d="M400,240 L400,100 L415,100 L415,240 Z M420,240 L420,130 L435,130 L435,240 Z M440,240 L440,80 L455,80 L455,240 Z M460,240 L460,110 L475,110 L475,240 Z" fill="#E2EEE4" />
            <path d="M405,240 L405,120 L410,120 L410,240 Z M445,240 L445,90 L450,90 L450,240 Z" fill="#D3E6DB" />
            
            {/* Birds */}
            <path d="M370,50 Q375,45 380,50 Q385,45 390,50" stroke="#118A3B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d="M395,40 Q398,36 401,40 Q404,36 407,40" stroke="#118A3B" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            
            {/* Green Hills & Curves */}
            <path d="M-50,230 Q100,160 250,210 T550,180 L550,330 L-50,330 Z" fill="#E8F4EC" />
            <path d="M-50,260 Q150,210 320,260 T550,210 L550,330 L-50,330 Z" fill="#D0E9D9" />
            <path d="M-50,290 Q120,260 280,290 T550,250 L550,330 L-50,330 Z" fill="#B9DFCE" />
            <path d="M-50,320 Q180,280 350,310 T550,280 L550,330 L-50,330 Z" fill="#118A3B" opacity="0.15" />
            
            {/* Vectors of houses nestled */}
            {/* Left little house */}
            <g transform="translate(10, 160) scale(0.6)">
              <polygon points="50,40 10,70 90,70" fill="#2E7D32" />
              <rect x="20" y="70" width="60" height="50" fill="white" stroke="#2E7D32" strokeWidth="2" />
              <rect x="35" y="85" width="30" height="35" fill="#E8F5E9" />
              <rect x="40" y="75" width="10" height="10" fill="#C8E6C9" />
            </g>
            <g transform="translate(80, 175) scale(0.5)">
              <polygon points="50,40 10,70 90,70" fill="#118A3B" />
              <rect x="20" y="70" width="60" height="50" fill="white" stroke="#118A3B" strokeWidth="2" />
              <rect x="40" y="80" width="20" height="40" fill="#D0E9D9" />
            </g>
            {/* Right big trees */}
            <circle cx="460" cy="180" r="22" fill="#2E7D32" opacity="0.6" />
            <circle cx="475" cy="190" r="18" fill="#118A3B" opacity="0.75" />
            
            <g transform="translate(420, 168) scale(0.4)">
              <path d="M50,10 L10,90 L90,90 Z" fill="#2E7D32" />
              <rect x="45" y="90" width="10" height="20" fill="#3E2723" />
            </g>

            <defs>
              <linearGradient id="skyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EBF7F0" />
                <stop offset="100%" stopColor="#FFFFFF" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Logo design centered containing hands, circle text */}
        <div className="z-10 mt-2 relative animate-fade-in">
          <div className="w-[140px] h-[140px] rounded-full border-[3px] border-[#118A3B] bg-white flex flex-col items-center justify-between p-2 shadow-md overflow-hidden">
            {/* Green and Orange Unified Design */}
            <div className="flex flex-col items-center w-full h-full justify-between">
              {/* Top - People symbols & Trees */}
              <div className="flex items-end justify-center space-x-1 pt-1">
                <div className="w-2.5 h-6 bg-[#ED6A14] rounded-full transform rotate-[-12deg]" />
                <div className="w-3.5 h-9 bg-[#118A3B] rounded-full" />
                <div className="w-2.5 h-6 bg-[#ED6A14] rounded-full transform rotate-[12deg]" />
              </div>
              
              {/* House vector inside logo */}
              <div className="flex items-end space-x-1 select-none">
                <svg width="60" height="20" viewBox="0 0 60 20" fill="none">
                  <path d="M10,20 L10,12 L15,8 L20,12 L20,20 Z" fill="#118A3B" />
                  <path d="M22,20 L22,10 L30,5 L38,10 L38,20 Z" fill="#2E7D32" />
                  <path d="M40,20 L40,14 L45,10 L50,14 L50,20 Z" fill="#118A3B" />
                </svg>
              </div>

              {/* Title Circle and Text */}
              <div className="w-full text-center border-t border-b border-[#118A3B]/40 py-0.5 my-0.5">
                <div className="text-[7.5px] tracking-[0.2px] text-gray-500 font-medium">CỘNG ĐỒNG DÂN CƯ</div>
                <div className="text-[11px] font-bold text-[#118A3B] tracking-wide">THÔN TÂN AN</div>
              </div>

              {/* Hands icon vector / Handshake symbol in logo bottom */}
              <div className="flex items-center justify-center bg-[#ED6A14] hover:bg-[#d65d0f] text-white py-0.5 px-3 rounded-full space-x-1 mb-0.5 cursor-pointer max-w-[120px] transition-all duration-300">
                <span className="text-[6.5px] font-bold font-mono tracking-widest text-[#FFF]">ĐOÀN KẾT - GẮN BÓ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Titles exactly as requested */}
        <div className="z-10 text-center mt-3 animate-fade-in-delayed">
          <h1 id="app-title-main" className="text-xl md:text-2xl font-black text-[#118A3B] tracking-wider font-sans">
            HỆ THỐNG QUẢN LÝ
          </h1>
          <p id="app-subtitle-sub" className="text-xs md:text-sm text-[#7F8C8D] font-medium mt-1">
            Cộng đồng dân cư thôn Tân An
          </p>
          
          {/* Centered Green leaf divider */}
          <div className="flex items-center justify-center space-x-4 mt-2 mb-1">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#118A3B]" />
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none" className="text-[#118A3B]">
              <path d="M8,1 C11,1 15,3 15,7 C15,11 11,11 8,9 C5,11 1,11 1,7 C1,3 5,1 8,1 Z" fill="currentColor" />
            </svg>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#118A3B]" />
          </div>
        </div>
      </div>

      {/* 2. Khung đăng nhập card - custom design with 30px rounded corners and smooth shadows */}
      <div className="z-10 px-5 flex-1 max-w-md mx-auto w-full transition-all">
        <div id="login-container-card" className="bg-white rounded-[30px] p-6 shadow-[0_8px_30px_rgb(17,138,59,0.06)] border border-[#E8F4EC]">
          <div className="mb-5">
            <h2 id="login-intro-title" className="text-xl font-bold text-[#1A252C]">Chào mừng bạn!</h2>
            <p className="text-xs text-[#7F8C8D] mt-1 font-medium">Vui lòng đăng nhập để tiếp tục</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Tên đăng nhập */}
            <div className="space-y-1.5">
              <label id="lbl-username" htmlFor="username" className="text-xs font-semibold text-[#118A3B] block">
                Tên đăng nhập
              </label>
              <div className="relative rounded-xl overflow-hidden shadow-sm transition-all duration-300 focus-within:shadow-md focus-within:ring-2 focus-within:ring-[#118A3B]/30">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User size={18} className="text-[#118A3B]" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-[#F9FBF9] border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#118A3B]"
                  placeholder="Nhập tên đăng nhập"
                  required
                />
              </div>
            </div>

            {/* Mật khẩu */}
            <div className="space-y-1.5">
              <label id="lbl-password" htmlFor="password" className="text-xs font-semibold text-[#118A3B] block">
                Mật khẩu
              </label>
              <div className="relative rounded-xl overflow-hidden shadow-sm transition-all duration-300 focus-within:shadow-md focus-within:ring-2 focus-within:ring-[#118A3B]/30">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} className="text-[#118A3B]" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 bg-[#F9FBF9] border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#118A3B]"
                  placeholder="Nhập mật khẩu"
                  required
                />
                <button
                  type="button"
                  id="btn-eye-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div id="login-error-msg" className="bg-red-50 text-red-600 text-xs p-2.5 rounded-lg border border-red-100 font-medium">
                {error}
              </div>
            )}

            {/* Remember Me and Forgot Password row */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label id="chk-remember-label" className="flex items-center space-x-2 text-gray-600 font-semibold cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="remember-me"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="w-4 h-4 text-[#118A3B] border-gray-300 rounded focus:ring-[#118A3B]"
                />
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <button
                type="button"
                id="btn-forgot-password"
                onClick={() => alert('Vui lòng liên hệ Trưởng thôn hoặc Quản trị viên hệ thống để khôi phục mật khẩu.')}
                className="text-[#118A3B] hover:underline font-bold"
              >
                Quên mật khẩu?
              </button>
            </div>

            {/* Login button: Height 56px, rounded 18px, green color, Lock icon */}
            <button
              type="submit"
              id="btn-login-submit"
              className="w-full h-[56px] bg-[#118A3B] hover:bg-[#0d6d2e] text-white font-bold rounded-[18px] shadow-md shadow-green-900/10 hover:shadow-lg flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.01] active:scale-[0.99] mt-6"
            >
              <Lock size={18} />
              <span>Đăng nhập</span>
            </button>
          </form>

          {/* Separator block */}
          <div className="relative my-5 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <span id="label-divider-or" className="relative px-3 bg-white text-xs text-gray-400 font-medium">
              hoặc đăng nhập với
            </span>
          </div>

          {/* SSO button - White background, outline green, shield icon */}
          <button
            type="button"
            id="btn-login-sso"
            onClick={onNavigateToSso}
            className="w-full py-3 bg-white hover:bg-gray-50 border border-[#118A3B] hover:border-[#0d6d2e] text-[#118A3B] font-bold rounded-xl flex items-center justify-center space-x-2 transition-colors duration-200 text-sm shadow-sm"
          >
            <Shield size={18} className="text-[#118A3B]" />
            <span>Đăng nhập bằng tài khoản SSO</span>
          </button>
        </div>
      </div>

      {/* 3. Phần hỗ trợ - Support credentials aligned beautifully */}
      <div className="z-10 mt-auto pt-6 px-6 max-w-sm mx-auto w-full flex flex-col items-center justify-end space-y-2 text-center text-xs text-[#5D6D7E] animate-fade-in-delayed">
        <a
          href="tel:0889070807"
          id="btn-call-support"
          className="flex items-center space-x-2 hover:text-[#118A3B] transition-colors bg-white px-4 py-1.5 rounded-full border border-gray-100 shadow-sm w-full justify-center"
        >
          <Phone size={14} className="text-[#118A3B] inline" />
          <span>Số điện thoại hỗ trợ: <strong className="text-[#2C3E50] ml-0.5">0889070807</strong></span>
        </a>
        
        <a
          href="mailto:duongvanha.offline@gmail.com"
          id="btn-email-support"
          className="flex items-center space-x-2 hover:text-[#118A3B] transition-colors bg-white px-4 py-1.5 rounded-full border border-gray-100 shadow-sm w-full justify-center"
        >
          <Mail size={14} className="text-[#118A3B] inline" />
          <span>Email hỗ trợ: <strong className="text-[#118A3B] ml-0.5 break-all underline">duongvanha.offline@gmail.com</strong></span>
        </a>
      </div>
    </div>
  );
}

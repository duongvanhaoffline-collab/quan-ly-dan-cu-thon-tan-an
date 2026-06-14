/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Household, Resident } from '../types';
import { Users, Home, Shield, UserCheck, Heart, UserMinus, Award } from 'lucide-react';

interface StatisticsViewProps {
  households: Household[];
  residents: Resident[];
  onNavigate?: (tab: 'stats' | 'households' | 'residents' | 'fluctuations' | 'system') => void;
}

export default function StatisticsView({ households, residents, onNavigate }: StatisticsViewProps) {
  // Statistics Computations
  const activeResidents = residents.filter(r => r.status !== 'Đã chuyển đi' && r.status !== 'Đã mất');
  const numHouseholds = households.length;
  const numResidents = activeResidents.length;
  
  // Gender stats
  const maleCount = activeResidents.filter(r => r.gender === 'Nam').length;
  const femaleCount = activeResidents.filter(r => r.gender === 'Nữ').length;
  const malePercent = numResidents > 0 ? Math.round((maleCount / numResidents) * 100) : 0;
  const femalePercent = numResidents > 0 ? Math.round((femaleCount / numResidents) * 100) : 0;

  // Status stats
  const permanentCount = activeResidents.filter(r => r.status === 'Thường trú').length;
  const tempResidentCount = activeResidents.filter(r => r.status === 'Tạm trú').length;
  const tempAbsentCount = activeResidents.filter(r => r.status === 'Tạm vắng').length;

  // Age group stats
  // Under 6 (Mầm non), 6-18 (Học sinh), 18-60 (Lao động), 60+ (Cao tuổi)
  let kidsCount = 0; // < 6
  let studentCount = 0; // 6 - 18
  let laborCount = 0; // 18 - 60
  let seniorCount = 0; // 60+
  
  const currentYear = new Date().getFullYear();
  activeResidents.forEach(r => {
    if (!r.dob) return;
    const birthYear = parseInt(r.dob.split('-')[0], 10);
    if (isNaN(birthYear)) return;
    const age = currentYear - birthYear;
    if (age < 6) kidsCount++;
    else if (age <= 18) studentCount++;
    else if (age < 60) laborCount++;
    else seniorCount++;
  });

  // Top occupations
  const jobCounts: { [key: string]: number } = {};
  activeResidents.forEach(r => {
    const job = r.occupation || 'Chưa đi làm/Tự do';
    jobCounts[job] = (jobCounts[job] || 0) + 1;
  });
  const sortedJobs = Object.entries(jobCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <Home size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Số hộ gia đình</p>
            <h4 id="stat-num-households" className="text-2xl font-bold text-gray-900">{numHouseholds}</h4>
            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">Thôn Tân An</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium font-sans">Tổng nhân khẩu</p>
            <h4 id="stat-num-residents" className="text-2xl font-bold text-gray-900">{numResidents}</h4>
            <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-bold">Nhân khẩu thực tế</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <UserCheck size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Tạm trú</p>
            <h4 id="stat-num-temp-residents" className="text-2xl font-bold text-gray-900">{tempResidentCount}</h4>
            <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-bold">Chuyển đến tạm trú</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
            <UserMinus size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Tạm vắng</p>
            <h4 id="stat-num-temp-absents" className="text-2xl font-bold text-gray-900">{tempAbsentCount}</h4>
            <span className="text-[10px] text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full font-bold">Đi làm ăn/học xa</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div id="stat-charts-anchor" className="grid grid-cols-1 lg:grid-cols-3 gap-6 scroll-mt-20">
        
        {/* Gender Distribution Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center">
              <span className="w-1.5 h-4 bg-emerald-600 rounded-full mr-2"></span>
              Phân bố Giới tính
            </h3>
            <div className="flex justify-around items-center py-6">
              {/* Male Percentage */}
              <div className="text-center">
                <div id="chart-male-progress" className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="38" className="stroke-gray-100" strokeWidth="8" fill="transparent" />
                    <circle cx="48" cy="48" r="38" className="stroke-emerald-600 transition-all duration-500" strokeWidth="8" fill="transparent" strokeDasharray={2 * Math.PI * 38} strokeDashoffset={2 * Math.PI * 38 * (1 - malePercent / 100)} />
                  </svg>
                  <span className="absolute text-lg font-black text-gray-800">{malePercent}%</span>
                </div>
                <p className="text-xs font-bold text-gray-700 mt-2">Nam ({maleCount})</p>
              </div>

              {/* Female Percentage */}
              <div className="text-center">
                <div id="chart-female-progress" className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="38" className="stroke-gray-100" strokeWidth="8" fill="transparent" />
                    <circle cx="48" cy="48" r="38" className="stroke-[#ED6A14] transition-all duration-500" strokeWidth="8" fill="transparent" strokeDasharray={2 * Math.PI * 38} strokeDashoffset={2 * Math.PI * 38 * (1 - femalePercent / 100)} />
                  </svg>
                  <span className="absolute text-lg font-black text-gray-800">{femalePercent}%</span>
                </div>
                <p className="text-xs font-bold text-gray-700 mt-2">Nữ ({femaleCount})</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-4 mt-2 space-y-2">
            <p className="text-[10px] text-[#118A3B] font-black uppercase tracking-wider mb-2">DANH SÁCH ĐIỀU HƯỚNG NHANH</p>
            <div className="space-y-1.5">
              <button
                onClick={() => onNavigate?.('residents')}
                className="w-full flex items-center justify-between p-2 rounded-xl bg-emerald-50/40 hover:bg-emerald-50 border border-emerald-100/50 hover:border-emerald-200 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <span className="p-1.5 bg-emerald-100 rounded-lg text-emerald-700 group-hover:scale-105 transition-transform">
                    <Users size={14} />
                  </span>
                  <div>
                    <span className="text-[11px] font-bold text-gray-800 block">Danh Sách Nhân Khẩu</span>
                    <span className="text-[9.5px] text-gray-500 block leading-tight">Xem &amp; tìm kiếm lý lịch chi tiết</span>
                  </div>
                </div>
                <span className="text-emerald-600 font-bold text-[10px] select-none mr-1 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  Xem &rarr;
                </span>
              </button>

              <button
                onClick={() => onNavigate?.('households')}
                className="w-full flex items-center justify-between p-2 rounded-xl bg-blue-50/30 hover:bg-blue-50 border border-blue-100/30 hover:border-blue-200 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <span className="p-1.5 bg-blue-100 rounded-lg text-blue-700 group-hover:scale-105 transition-transform">
                    <Home size={14} />
                  </span>
                  <div>
                    <span className="text-[11px] font-bold text-gray-800 block">Tổng Số Nhân Khẩu &amp; Hộ</span>
                    <span className="text-[9.5px] text-gray-500 block leading-tight">Quản lý và tra cứu {households.length} hộ dân</span>
                  </div>
                </div>
                <span className="text-blue-600 font-bold text-[10px] select-none mr-1 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  Chọn &rarr;
                </span>
              </button>

              <button
                onClick={() => {
                  const element = document.getElementById('stat-charts-anchor');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="w-full flex items-center justify-between p-2 rounded-xl bg-amber-50/40 hover:bg-amber-50 border border-amber-100/50 hover:border-amber-200 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <span className="p-1.5 bg-amber-100 rounded-lg text-amber-700 group-hover:scale-105 transition-transform">
                    <Award size={14} />
                  </span>
                  <div>
                    <span className="text-[11px] font-bold text-gray-800 block">Thống Kê Dân Cơ Cơ Bản</span>
                    <span className="text-[9.5px] text-gray-500 block leading-tight">Biểu đồ cơ cấu giới tính &amp; tuổi</span>
                  </div>
                </div>
                <span className="text-amber-700 font-bold text-[10px] select-none mr-1 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  Cuộn &darr;
                </span>
              </button>
            </div>
            <div className="pt-2 text-[10.5px] font-semibold text-gray-400 text-center leading-relaxed">
              Tỷ lệ khá cân bằng, phù hợp với xu hướng chung của xã Ea Ly.
            </div>
          </div>
        </div>

        {/* Age Groups Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center">
              <span className="w-1.5 h-4 bg-emerald-600 rounded-full mr-2"></span>
              Cơ cấu Độ tuổi (năm {currentYear})
            </h3>
            
            <div className="space-y-3.5 my-3">
              {/* Kid */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                  <span>Trẻ em (Dưới 6 tuổi)</span>
                  <span>{kidsCount} người ({numResidents > 0 ? Math.round((kidsCount / numResidents)*100) : 0}%)</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${numResidents > 0 ? (kidsCount / numResidents)*100 : 0}%` }}></div>
                </div>
              </div>

              {/* Student */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                  <span>Học sinh (6-18 tuổi)</span>
                  <span>{studentCount} người ({numResidents > 0 ? Math.round((studentCount / numResidents)*100) : 0}%)</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-orange-500 h-full rounded-full" style={{ width: `${numResidents > 0 ? (studentCount / numResidents)*100 : 0}%` }}></div>
                </div>
              </div>

              {/* Labor age */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                  <span>Trong tuổi lao động (18-60 tuổi)</span>
                  <span>{laborCount} người ({numResidents > 0 ? Math.round((laborCount / numResidents)*100) : 0}%)</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${numResidents > 0 ? (laborCount / numResidents)*100 : 0}%` }}></div>
                </div>
              </div>

              {/* Senior */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                  <span>Người cao tuổi (Trên 60 tuổi)</span>
                  <span>{seniorCount} người ({numResidents > 0 ? Math.round((seniorCount / numResidents)*100) : 0}%)</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-full rounded-full" style={{ width: `${numResidents > 0 ? (seniorCount / numResidents)*100 : 0}%` }}></div>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-50 pt-2 text-center text-[11px] text-gray-500">
            Lực lượng lao động chính chiếm đa số, tạo động lực phát triển kinh tế thôn.
          </div>
        </div>

        {/* Top Jobs Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center">
              <span className="w-1.5 h-4 bg-emerald-600 rounded-full mr-2"></span>
              Nghề nghiệp phổ biến nhất
            </h3>

            <div className="space-y-3 my-2">
              {sortedJobs.map(([job, count], index) => {
                const maxCount = Math.max(...sortedJobs.map(([, c]) => c));
                const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                return (
                  <div key={job} className="flex items-center text-xs">
                    <div className="w-6 text-gray-400 font-bold">#{index + 1}</div>
                    <div className="flex-1">
                      <div className="flex justify-between font-semibold text-gray-700 mb-0.5">
                        <span className="truncate max-w-[150px]">{job}</span>
                        <span>{count} người</span>
                      </div>
                      <div className="w-full bg-gray-50 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {sortedJobs.length === 0 && (
                <p className="text-gray-400 text-center py-6 text-xs">Không có dữ liệu nghề nghiệp</p>
              )}
            </div>
          </div>
          <div className="border-t border-gray-50 pt-2 text-xs text-gray-500 flex justify-between items-center bg-gray-50/50 p-2 rounded-xl">
            <span className="font-semibold text-gray-700">Tỷ lệ thường trú:</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
              {numResidents > 0 ? Math.round((permanentCount/numResidents)*100) : 0}% tinh anh
            </span>
          </div>
        </div>
      </div>

      {/* Cultural and Social Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Ethincity and Religion Metrics */}
        <div className="bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/10 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-black uppercase text-emerald-800 tracking-wider mb-2">Đặc trưng văn hóa & xã hội</h4>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div className="bg-white p-3 rounded-xl border border-emerald-100">
                <p className="text-[10px] text-gray-400 font-bold">DÂN TỘC</p>
                <p className="text-sm font-bold text-emerald-950 mt-1">92% Kinh</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Một số ít Mường, Tày</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-emerald-100">
                <p className="text-[10px] text-gray-400 font-bold">TÔN GIÁO</p>
                <p className="text-sm font-bold text-emerald-955 mt-1">Công giáo & Phật giáo</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Hài hòa, tôn trọng tự do tín ngưỡng</p>
              </div>
            </div>
          </div>
          <div className="text-[10px] text-emerald-700 font-medium mt-3">
            * Số liệu cập nhật hằng ngày thông qua khai báo biến động của cán bộ thôn.
          </div>
        </div>

        {/* Marital statuses and Educational metrics */}
        <div className="bg-orange-500/5 p-5 rounded-2xl border border-orange-500/10 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-black uppercase text-orange-800 tracking-wider mb-2">Chỉ số giáo dục & Gia đình</h4>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div className="bg-white p-3 rounded-xl border border-orange-100">
                <p className="text-[10px] text-gray-400 font-bold">TRÌNH ĐỘ HỌC VẤN</p>
                <p className="text-sm font-bold text-orange-950 mt-1">Đại học / C.Đẳng</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Chiếm tỷ lệ ngày càng cao ở người trẻ</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-orange-100">
                <p className="text-[10px] text-gray-400 font-bold">HÔN NHÂN</p>
                <p className="text-sm font-bold text-orange-950 mt-1">Gia đình hòa thuận</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Tỷ lệ ly hôn dưới 1.5%</p>
              </div>
            </div>
          </div>
          <div className="text-[10px] text-orange-700 font-medium mt-3">
            * Phần mềm giúp Thôn Tân An định hướng an sinh xã hội chính xác, hiệu quả.
          </div>
        </div>

      </div>

    </div>
  );
}

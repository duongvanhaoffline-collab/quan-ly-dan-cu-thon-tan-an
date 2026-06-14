/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Household {
  householdNumber: string; // Số sổ hộ gia đình
  headName: string;        // Tên chủ hộ
  address: string;         // Địa chỉ
  phone: string;           // Số điện thoại liên hệ
  creationDate: string;    // Ngày lập sổ
}

export interface Resident {
  id: string;
  householdNumber: string;         // Thuộc hộ khẩu nào
  fullName: string;                // Họ và tên
  dob: string;                     // Ngày sinh
  gender: 'Nam' | 'Nữ';           // Giới tính
  ethnicity: string;               // Dân tộc
  religion: string;                // Tôn giáo
  hometown: string;                // Quê quán
  registeredResidence: string;     // Thường trú
  currentResidence: string;        // Nơi ở hiện nay
  relationWithHead: string;        // Quan hệ với chủ hộ
  cccd: string;                    // Số CCCD
  cccdDate: string;                // Ngày cấp
  cccdPlace: string;               // Nơi cấp
  phone: string;                   // Số điện thoại
  education: string;               // Trình độ học vấn
  occupation: string;              // Nghề nghiệp
  maritalStatus: 'Độc thân' | 'Đã kết hôn' | 'Đã ly hôn' | 'Góa'; // Tình trạng hôn nhân
  notes: string;                   // Ghi chú
  status: 'Thường trú' | 'Tạm trú' | 'Tạm vắng' | 'Đã chuyển đi' | 'Đã mất'; // Trạng thái nhân khẩu
}

export interface HistoryLog {
  id: string;
  timestamp: string;
  author: string;
  actionType: 
    | 'Khai sinh' 
    | 'Khai tử' 
    | 'Chuyển đến' 
    | 'Chuyển đi' 
    | 'Tạm trú' 
    | 'Tạm vắng' 
    | 'Kết hôn' 
    | 'Ly hôn' 
    | 'Cập nhật hộ khẩu' 
    | 'Cập nhật nhân khẩu' 
    | 'Xóa nhân khẩu'
    | 'Xóa hộ khẩu'
    | 'Nhập hàng loạt'
    | 'Khôi phục sao lưu';
  description: string;
}

export interface SystemUser {
  username: string;
  fullName: string;
  role: 'admin' | 'officer'; // Cán trị viên hoặc Cán bộ thôn
}

# 📚 Hệ Thống Quản Lý Thư Viện - Library Management System

Ứng dụng web quản lý thư viện hiện đại được xây dựng bằng Vue 3, Vite và Vue Router. Hệ thống cung cấp đầy đủ các chức năng quản lý sách, độc giả, mượn trả sách, và thống kê cho thư viện.

## ✨ Tính Năng

### 🔐 Xác Thực & Phân Quyền
- **Đăng nhập/Đăng ký**: Hệ thống xác thực người dùng an toàn
- **Quên mật khẩu**: Khôi phục mật khẩu qua email
- **Quản lý phiên**: Tự động quản lý token và session
- **Phân quyền**: Hỗ trợ nhiều vai trò (Admin, Staff, Reader)

### 👥 Quản Lý Người Dùng
- **Quản lý độc giả**: Thêm, sửa, xóa, tìm kiếm độc giả
- **Quản lý nhân viên**: Quản trị viên và nhân viên thư viện
- **Quản lý vai trò**: Phân quyền và quản lý quyền truy cập
- **Hồ sơ cá nhân**: Xem và chỉnh sửa thông tin cá nhân

### 📖 Quản Lý Sách
- **Danh mục sách**: Quản lý thông tin sách đầy đủ
- **Thể loại**: Phân loại sách theo thể loại
- **Nhà xuất bản**: Quản lý thông tin nhà xuất bản
- **Tìm kiếm nâng cao**: Tìm kiếm theo nhiều tiêu chí

### 📋 Quản Lý Mượn Trả
- **Mượn sách**: Tạo phiếu mượn cho độc giả
- **Trả sách**: Xử lý trả sách và tính phí phạt
- **Theo dõi**: Giám sát tình trạng mượn trả
- **Lịch sử**: Xem lịch sử giao dịch

### 📊 Thống Kê & Báo Cáo
- **Dashboard**: Tổng quan hệ thống
- **Thống kê**: Báo cáo chi tiết về hoạt động
- **Giám sát**: Theo dõi tình trạng hệ thống
- **Biểu đồ**: Trực quan hóa dữ liệu

### 👤 Giao Diện Độc Giả
- **Tìm sách**: Tìm kiếm và xem thông tin sách
- **Lịch sử mượn**: Xem sách đã mượn
- **Thông báo**: Nhận thông báo về sách sắp đến hạn

## 🚀 Bắt Đầu

### Yêu Cầu Hệ Thống

- **Node.js**: Phiên bản 20.19.0+ hoặc 22.12.0+
- **npm**: Phiên bản 8.0.0+ (đi kèm với Node.js)
- **Trình duyệt**: Chrome, Firefox, Safari, hoặc Edge (phiên bản mới nhất)

### Cài Đặt

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd library_management_client/vue-project
   ```

2. **Cài đặt dependencies**
   ```bash
   npm install
   ```

3. **Cấu hình ứng dụng**
   
   Mở file `src/config/app.config.js` và điều chỉnh các cấu hình:

   ```javascript
   // Sử dụng Mock API (fake data) hay Real API
   export const USE_MOCK_API = true  // false để kết nối backend thật

   // Hash password ở frontend
   export const HASH_PASSWORD_ON_FRONTEND = true

   // Base URL của API
   export const API_BASE_URL = 'http://localhost:8000/api'
   ```

4. **Chạy ứng dụng ở chế độ development**
   ```bash
   npm run dev
   ```

   Ứng dụng sẽ chạy tại: `http://localhost:5173`

### Build cho Production

```bash
# Build ứng dụng
npm run build

# Preview bản build
npm run preview
```

Các file build sẽ được tạo trong thư mục `dist/`

## 🏗️ Cấu Trúc Project

```
vue-project/
├── public/                      # Static assets
├── src/
│   ├── assets/                 # CSS và assets
│   │   ├── base.css
│   │   └── main.css
│   │
│   ├── components/             # Vue components tái sử dụng
│   │   ├── AdminHeader.vue     # Header cho admin
│   │   ├── ReaderHeader.vue    # Header cho độc giả
│   │   ├── Sidebar.vue         # Sidebar navigation
│   │   ├── ToastNotification.vue
│   │   └── ConfirmModal.vue
│   │
│   ├── composables/            # Vue Composition API composables
│   │   ├── useLogin.js         # Logic đăng nhập
│   │   ├── useRegister.js      # Logic đăng ký
│   │   ├── useBooksManagement.js
│   │   ├── useLoansManagement.js
│   │   ├── useReadersManagement.js
│   │   ├── useStatistics.js
│   │   └── ...
│   │
│   ├── config/                 # Cấu hình ứng dụng
│   │   └── app.config.js       # Cấu hình chính
│   │
│   ├── router/                 # Vue Router
│   │   └── index.js            # Route definitions
│   │
│   ├── services/               # API services
│   │   ├── api.js              # API client
│   │   ├── apiEndpoints.js     # API endpoints
│   │   └── apiHelpers.js       # Helper functions
│   │
│   ├── styles/                 # Component-specific styles
│   │   ├── LoginView.css
│   │   ├── DashboardView.css
│   │   └── ...
│   │
│   ├── utils/                  # Utility functions
│   │   ├── crypto.js           # Password hashing
│   │   └── errorHandler.js     # Error handling
│   │
│   ├── views/                  # Page components
│   │   ├── LoginView.vue
│   │   ├── DashboardView.vue
│   │   ├── BooksManagementView.vue
│   │   ├── ReadersManagementView.vue
│   │   └── ...
│   │
│   ├── App.vue                 # Root component
│   └── main.js                 # Entry points
│
├── index.html                  # HTML template
├── package.json                # Dependencies
├── vite.config.js             # Vite configuration
└── README.md                   # Tài liệu này
```

## 🔧 Cấu Hình

### API Configuration

File `src/config/app.config.js` chứa các cấu hình quan trọng:

#### Mock API vs Real API

```javascript
export const USE_MOCK_API = true
```
- `true`: Sử dụng dữ liệu giả (fake data), không cần backend
- `false`: Kết nối với backend API thực

#### Password Hashing

```javascript
export const HASH_PASSWORD_ON_FRONTEND = true
```
- `true`: Hash password bằng SHA-256 ở frontend trước khi gửi lên server
- `false`: Gửi plaintext password, để backend tự hash

#### API Base URL

```javascript
export const API_BASE_URL = 'http://localhost:8000/api'
```
Thay đổi URL này để trỏ đến backend API của bạn.

### Router Guards

Ứng dụng sử dụng navigation guards để bảo vệ các route:
- Routes công khai: `/login`, `/register`, `/forgot-password`
- Routes yêu cầu xác thực: Dashboard, quản lý sách, quản lý độc giả, v.v.
- Tự động redirect đến `/login` nếu chưa đăng nhập

## 👨‍💻 Hướng Dẫn Sử Dụng

### Đăng Nhập

1. Truy cập `http://localhost:5173`
2. Nhập username và password
3. Click "Đăng nhập"

### Quản Lý Sách (Admin/Staff)

1. Đăng nhập với tài khoản admin/staff
2. Vào menu "Quản lý sách"
3. Các thao tác:
   - **Thêm sách**: Click nút "Thêm sách mới"
   - **Sửa sách**: Click biểu tượng chỉnh sửa
   - **Xóa sách**: Click biểu tượng xóa
   - **Tìm kiếm**: Sử dụng thanh tìm kiếm

### Quản Lý Mượn Trả (Admin/Staff)

1. Vào menu "Quản lý mượn trả"
2. **Tạo phiếu mượn mới**:
   - Click "Tạo phiếu mượn"
   - Chọn độc giả
   - Chọn sách
   - Nhập ngày mượn/trả
3. **Trả sách**:
   - Tìm phiếu mượn
   - Click "Trả sách"
   - Hệ thống tự động tính phí phạt nếu trễ hạn

### Xem Thống Kê (Admin)

1. Vào menu "Thống kê"
2. Chọn khoảng thời gian
3. Xem các báo cáo:
   - Số lượng sách mượn/trả
   - Top sách được mượn nhiều nhất
   - Biểu đồ thống kê

### Giao Diện Độc Giả (Reader)

1. Đăng nhập với tài khoản reader
2. Tìm kiếm sách trong thư viện
3. Xem lịch sử mượn sách
4. Kiểm tra sách sắp đến hạn

## 🛠️ Development

### Cấu Trúc Composables

Project sử dụng Vue 3 Composition API với pattern composables:

```javascript
// Ví dụ: useBooksManagement.js
export function useBooksManagement() {
  const books = ref([])
  const loading = ref(false)
  
  const fetchBooks = async () => {
    loading.value = true
    try {
      const response = await api.get('/books')
      books.value = response.data
    } catch (error) {
      handleError(error)
    } finally {
      loading.value = false
    }
  }
  
  return {
    books,
    loading,
    fetchBooks
  }
}
```

### API Service

Tất cả API calls được quản lý tập trung trong `src/services/`:

```javascript
// apiEndpoints.js - Định nghĩa endpoints
export const ENDPOINTS = {
  LOGIN: '/auth/login',
  BOOKS: '/books',
  READERS: '/readers',
  // ...
}

// api.js - API client với interceptors
export const api = {
  get: (url, config) => { /* ... */ },
  post: (url, data, config) => { /* ... */ },
  // ...
}
```

### Error Handling

Ứng dụng có hệ thống xử lý lỗi tập trung:

```javascript
// errorHandler.js
export function handleError(error) {
  // Xử lý lỗi network, authentication, validation
  // Hiển thị thông báo phù hợp
}
```

Xem file `ERROR_HANDLING_GUIDE.md` để biết chi tiết.

## 🎨 Styling

- **CSS Framework**: Custom CSS
- **Icons**: Font Awesome 7.1.0
- **Responsive**: Mobile-friendly design
- **Theme**: Hệ thống màu nhất quán

Mỗi view có file CSS riêng trong `src/styles/`

## 🔒 Bảo Mật

- ✅ Password hashing (SHA-256)
- ✅ JWT token authentication
- ✅ Route guards
- ✅ Input validation
- ✅ XSS protection
- ✅ CSRF protection

## 📝 Scripts

```bash
# Development server với hot-reload
npm run dev

# Build cho production
npm run build

# Preview bản build
npm run preview
```

## 🐛 Troubleshooting

### Lỗi kết nối API

**Vấn đề**: Không kết nối được với backend API

**Giải pháp**:
1. Kiểm tra `API_BASE_URL` trong `app.config.js`
2. Đảm bảo backend đang chạy
3. Hoặc bật `USE_MOCK_API = true` để dùng mock data

### Lỗi đăng nhập

**Vấn đề**: Không đăng nhập được

**Giải pháp**:
1. Kiểm tra cấu hình `HASH_PASSWORD_ON_FRONTEND`
2. Đảm bảo frontend và backend dùng cùng phương thức hash
3. Xóa localStorage và thử lại

### Lỗi build

**Vấn đề**: Build failed

**Giải pháp**:
```bash
# Xóa node_modules và reinstall
rm -rf node_modules package-lock.json
npm install

# Clear cache
npm cache clean --force
```

## 💡 Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (disable Vetur nếu đang cài)

### Recommended Browser Setup

- **Chromium-based browsers** (Chrome, Edge, Brave):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) 
  - [Enable Custom Object Formatter](http://bit.ly/object-formatters)
- **Firefox**:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Enable Custom Object Formatter](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## 📚 Tài Liệu Tham Khảo

- [Vue 3 Documentation](https://vuejs.org/)
- [Vue Router Documentation](https://router.vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [Font Awesome Icons](https://fontawesome.com/icons)
- [Vite Configuration Reference](https://vite.dev/config/)

## 🤝 Đóng Góp

Contributions are welcome! Vui lòng:

1. Fork project
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Tác Giả

- **Developer**: [Your Name]
- **Email**: [your.email@example.com]
- **GitHub**: [github.com/yourusername]

## 🙏 Cảm Ơn

- Vue.js team
- Font Awesome
- All contributors

---

**Lưu ý**: Đây là project demo/học tập. Để sử dụng trong production, cần thêm các tính năng bảo mật và tối ưu hiệu suất

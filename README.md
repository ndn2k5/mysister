# MILO Energy Game - React/Vite

Đây là project React/Vite đã được đóng gói sẵn để chạy local và deploy lên GitHub Pages.

## 1. Chạy thử trên máy

Cài Node.js trước, sau đó mở Terminal/CMD tại thư mục project và chạy:

```bash
npm install
npm run dev
```

Mở link Vite hiện ra, thường là:

```text
http://localhost:5173/
```

## 2. Build thử trước khi đưa lên GitHub

```bash
npm run build
```

Nếu không báo lỗi, project đã sẵn sàng deploy.

## 3. Đưa project lên GitHub

### Cách dễ nhất bằng GitHub web

1. Vào GitHub.
2. Tạo repository mới, ví dụ: `milo-game-react`.
3. Giải nén file zip này.
4. Upload toàn bộ nội dung bên trong thư mục `milo-game-react` lên repository.
5. Nhấn Commit changes.

Lưu ý: phải upload các file như `package.json`, `vite.config.js`, `index.html`, thư mục `src`, thư mục `.github`... Không upload nguyên file `.zip` rồi để đó.

### Cách bằng Git command

```bash
git init
git add .
git commit -m "initial milo game react app"
git branch -M main
git remote add origin https://github.com/TEN-CUA-BAN/milo-game-react.git
git push -u origin main
```

Nhớ thay `TEN-CUA-BAN` và `milo-game-react` bằng tài khoản/repo thật của bạn.

## 4. Bật GitHub Pages

Vào repository trên GitHub:

```text
Settings → Pages → Build and deployment → Source → GitHub Actions
```

Sau đó vào tab:

```text
Actions
```

Đợi workflow chạy xong màu xanh.

## 5. Link trang web

Website sẽ có dạng:

```text
https://TEN-CUA-BAN.github.io/milo-game-react/
```

Nếu đổi tên repository thì link cũng đổi theo tên repository đó.

## 6. Nếu bị lỗi thường gặp

### Trang trắng sau khi deploy

Project này đã đặt `base: './'` trong `vite.config.js`, nên thường không cần sửa. Nếu vẫn trắng, vào tab Actions xem lỗi build.

### Actions báo lỗi thiếu quyền Pages

Vào:

```text
Settings → Pages → Source → GitHub Actions
```

rồi chạy lại workflow.

### Không thấy thư mục `.github`

Trên Windows, thư mục bắt đầu bằng dấu chấm có thể bị ẩn. Hãy bật chế độ hiện file ẩn hoặc dùng VS Code để kiểm tra.

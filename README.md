# AI 圖片風格轉換 (AI Image Style Transfer)

這是一個基於 React 和 Google Gemini 2.5 Flash Image 模型的 Web 應用程式，可以將上傳的照片轉換為各種藝術風格。

## 功能特點
- **圖片上傳**：支援點擊或拖曳上傳圖片。
- **預設風格**：內建動漫、賽博龐克、水彩、素描、3D 渲染等風格。
- **自訂風格**：支援輸入文字描述來定義獨特風格。
- **圖片下載**：轉換完成後可直接下載結果。

## 部署至 Ubuntu 伺服器

### 1. 環境準備
確保您的伺服器已安裝 Node.js (建議 v18+) 和 npm。

### 2. 取得原始碼
將此專案複製到您的伺服器：
```bash
git clone <您的 GitHub 倉庫網址>
cd <專案目錄>
```

### 3. 安裝依賴
```bash
npm install
```

### 4. 設定環境變數
建立 `.env` 檔案並填入您的 Gemini API Key：
```bash
cp .env.example .env
```
編輯 `.env`：
```env
GEMINI_API_KEY=您的_GEMINI_API_KEY
```
> **注意**：請勿將 `.env` 檔案上傳至 GitHub。本專案已在 `.gitignore` 中排除此檔案。

### 5. 建置與執行
您可以選擇使用開發模式或建置後部署。

#### 開發模式 (測試用)
```bash
npm run dev
```

#### 生產環境部署 (建議)
1. **建置專案**：
   ```bash
   npm run build
   ```
2. **使用 Nginx 服務靜態檔案**：
   將 `dist` 資料夾中的內容部署到 Nginx 的網頁根目錄。

## 安全提示
- 本應用程式目前將 API Key 編譯進前端程式碼中。若您的伺服器是對外公開的，請注意 API Key 可能會被有心人士從瀏覽器開發者工具中取得。
- 建議在家庭網路環境下使用，或考慮建立後端代理伺服器以隱藏 API Key。

## 授權
Apache-2.0

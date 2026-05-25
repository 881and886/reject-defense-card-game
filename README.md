# 611研究室：退件防禦

事件相剋型生存卡牌遊戲原型。

## 本機啟動
```bash
npm install
npm run dev
```

## 上傳新 Repository
1. GitHub 建立新的 repository
2. 將本資料夾內容放入 repository
3. 執行 `npm install` 與 `npm run dev` 測試
4. 推送到 GitHub 後可接 Vercel 部署

## 修改內容
- 角色資料：`src/gameData.js` 的 `characters`
- 事件資料：`src/gameData.js` 的 `events`
- 遊戲判定：`src/App.jsx` 的 `resolveChoice`

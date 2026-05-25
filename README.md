# 611研究室：退件防禦 v1.3

事件相剋型生存卡牌遊戲原型。

## v1.3 更新重點
- 加入五張角色卡圖：陳研究生、詩涵、書雅、老莫、瑪莉教授。
- 角色選擇畫面改成圖片卡牌式 UI。
- 遊戲進行中，玩家角色卡會固定顯示在左側；手機版會顯示在上方。
- 瑪莉教授目前設定為事件 Boss，不開放玩家選擇。
- 技能描述簡化，更接近遊戲技能效果。

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

## 修改內容位置
- 角色資料與圖片引用：`src/gameData.js`
- 事件資料：`src/gameData.js` 的 `events`
- 遊戲判定：`src/main.jsx` 的 `resolveChoice`
- 版面樣式：`src/style.css`
- 角色圖片：`src/assets/characters/`

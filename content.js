let isExtensionEnabled = true;

// もとのテキストを保存するためのWeakMap
const originalTexts = new WeakMap();

// トグルの設定を読み込む関数
function loadSettings() {
  chrome.storage.local.get({ isEnabled: true }, (result) => {
    isExtensionEnabled = result.isEnabled;
    if (isExtensionEnabled) {
      revealExactLikeCount();
    } else {
      restoreOriginalCounts();
    }
  });
}

// いいね数を正確に表示する関数
function revealExactLikeCount() {
  if (!isExtensionEnabled) return;

  // いいねボタンをすべて取得
  const likeButtons = document.querySelectorAll('[data-testid="like"], [data-testid="unlike"]');
  
  likeButtons.forEach((button) => {
    try {
      // aria-label属性からいいね数を抽出
      const ariaLabel = button.getAttribute("aria-label");
      if (!ariaLabel) return;

      const match = ariaLabel.match(/^([0-9,]+)/);
      if (match) {
        // カンマを除去して数値に変換
        const rawNumString = match[1].replace(/,/g, '');
        // 数値に変換
        const numValue = parseInt(rawNumString, 10);

        // 数値が正しく取得できた場合のみ処理
        if (!isNaN(numValue)) {
          const exactCountWithComma = numValue.toLocaleString();
          const textContainer = button.querySelector('[data-testid="app-text-transition-container"]');
          
          if (textContainer) {
            // すべてのspanを取得し、一番最後のspanをターゲットにする
            // 親spanを書き換えて子のスタイルを破壊するのを防ぐ
            const spans = textContainer.querySelectorAll('span');
            if (spans.length === 0) return;
            
            // 最後のspan要素を取得
            const targetSpan = spans[spans.length - 1];
            
            // テキストが空でないか確認
            if (targetSpan.textContent.trim().length > 0) {
              
              // まだ保存していないなら、今の表示をオリジナルとして保存
              if (!originalTexts.has(targetSpan)) {
                originalTexts.set(targetSpan, targetSpan.textContent);
              }
              
              // 書き換え実行
              if (targetSpan.textContent !== exactCountWithComma && exactCountWithComma !== "0") {
                targetSpan.textContent = exactCountWithComma;
              }
            }
          }
        }
      }
    } catch (e) {
      // console.warn(e);
    }
  });
}

// もとのいいね数表示に戻す関数
function restoreOriginalCounts() {
  const likeButtons = document.querySelectorAll('[data-testid="like"], [data-testid="unlike"]');
  
  likeButtons.forEach((button) => {
    try {
      const textContainer = button.querySelector('[data-testid="app-text-transition-container"]');
      if (textContainer) {
        // 書き換え時と同じロジックでターゲットを探す
        const spans = textContainer.querySelectorAll('span');
        if (spans.length === 0) return;
        const targetSpan = spans[spans.length - 1];
        
        // 保存されたテキストがあれば戻す
        if (targetSpan && originalTexts.has(targetSpan)) {
          targetSpan.textContent = originalTexts.get(targetSpan);
        }
      }
    } catch (e) {
      // console.warn(e);
    }
  });
}

// 初期化
loadSettings();

// 設定変更時のリスナー
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.isEnabled) {
    isExtensionEnabled = changes.isEnabled.newValue;
    if (isExtensionEnabled) {
      revealExactLikeCount();
    } else {
      restoreOriginalCounts();
    }
  }
});

// 監視設定
const observer = new MutationObserver((mutations) => {
  if (isExtensionEnabled) {
    revealExactLikeCount();
  }
});

// ページ全体の変更を監視
observer.observe(document.body, {
  childList: true,
  subtree: true
});
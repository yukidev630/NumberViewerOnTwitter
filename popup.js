document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("toggleSwitch");

  // 起動時に現在の設定を読み込む
  chrome.storage.local.get({ isEnabled: true }, (result) => {
    // スイッチの状態を設定
    toggle.checked = result.isEnabled;
  });

  // スイッチが切り替わったら保存する
  toggle.addEventListener("change", () => {
    // 変更後の状態を取得
    const isEnabled = toggle.checked;
    // 設定を保存
    chrome.storage.local.set({ isEnabled });
  });
});

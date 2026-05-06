// 取得した全データを保持する変数
let allData = { trivia: [], sales: [] };
let currentTab = 'trivia'; // 初期値は雑学

/**
 * 起動時にデータを取得
 */
async function init() {
    const cardContainer = document.getElementById('card-container');
    
    try {
        // APIからデータを取得
        const res = await fetch('/api/get-data');
        if (!res.ok) throw new Error('Network response was not ok');
        
        allData = await res.json();
        
        // データが空の場合のケア
        if (allData.trivia.length === 0 && allData.sales.length === 0) {
            document.getElementById('item-title').innerText = "データがありません";
            document.getElementById('item-content').innerText = "スプレッドシートに内容を追加";
        } else {
            showRandomContent();
        }
    } catch (e) {
        console.error("データ取得失敗:", e);
        document.getElementById('item-title').innerText = "エラー発生";
        document.getElementById('item-content').innerText = "データの取得に失敗しました。GASのURLや設定を確認してください。";
    }
}

/**
 * ランダムに1件表示（アニメーション付き）
 */
function showRandomContent() {
    const list = currentTab === 'trivia' ? allData.trivia : allData.sales;
    if (!list || list.length === 0) {
        document.getElementById('item-title').innerText = "空";
        document.getElementById('item-content').innerText = "書き込みタブから追加";
        return;
    }

    // ランダム抽出
    const item = list[Math.floor(Math.random() * list.length)];
    
    const titleEl = document.getElementById('item-title');
    const contentEl = document.getElementById('item-content');

    // アニメーションをリセットするために一度クラスを消す
    titleEl.classList.remove('fade-in');
    contentEl.classList.remove('fade-in', 'delay');

    // 内容を書き換え
    // スプシのヘッダーが「タイトル」「内容」であることを想定
    titleEl.innerText = item.タイトル || "無題";
    contentEl.innerText = item.内容 || "（内容がありません）";

    // わずかな遅延を入れてクラスを再付与し、アニメーションをトリガーする
    setTimeout(() => {
        titleEl.classList.add('fade-in');
        contentEl.classList.add('fade-in', 'delay');
    }, 50);
}

/**
 * タブ切り替えのイベント設定
 */
document.querySelectorAll('.tab-item').forEach(tab => {
    tab.addEventListener('click', () => {
        const target = tab.dataset.target;
        
        // タブとページの見た目を切り替え
        document.querySelectorAll('.tab-item, .page').forEach(el => el.classList.remove('active'));
        tab.classList.add('active');

        if (target === 'write') {
            document.getElementById('write-page').classList.add('active');
        } else {
            currentTab = target;
            // ページタイトルを更新
            document.getElementById('page-title').innerText = (target === 'trivia' ? '今日の雑学' : '今日の営業');
            document.getElementById('view-page').classList.add('active');
            showRandomContent();
        }
    });
});

/**
 * 「他のを見る」ボタン
 */
document.getElementById('next-btn').addEventListener('click', showRandomContent);

/**
 * 書き込み処理
 */
document.getElementById('submit-btn').addEventListener('click', async () => {
    const type = document.getElementById('post-type').value; // 「雑学」または「営業」
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;

    if (!title || !content) {
        alert("タイトルと内容を入力");
        return;
    }

    const btn = document.getElementById('submit-btn');
    const originalText = btn.innerText;
    btn.innerText = "送信中...";
    btn.disabled = true;

    try {
        const res = await fetch('/api/post-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, title, content })
        });
        
        const result = await res.json();

        if (result.status === 'success') {
            alert("登録完了");
            // フォームをクリア
            document.getElementById('post-title').value = "";
            document.getElementById('post-content').value = "";
            // データを再取得して、一覧を最新にする
            await init();
        } else {
            throw new Error(result.message);
        }
    } catch (e) {
        console.error("送信失敗:", e);
        alert("送信に失敗");
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
});

// アプリ起動！
init();
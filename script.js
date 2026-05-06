let allData = { trivia: [], sales: [] };
let currentTab = 'trivia';

/**
 * 起動処理
 */
async function init() {
    const loader = document.getElementById('loading-screen');
    
    try {
        const res = await fetch('/api/get-data');
        if (!res.ok) throw new Error('Fetch failed');
        
        allData = await res.json();
        
        if (allData.trivia.length > 0 || allData.sales.length > 0) {
            showRandomContent();
        }

        // 華やかにフェードアウト
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 800);
        }, 500);

    } catch (e) {
        console.error(e);
        document.getElementById('item-title').innerText = "接続エラー";
        loader.style.display = 'none';
    }
}

/**
 * カード表示（アニメーション付き）
 */
function showRandomContent() {
    const list = currentTab === 'trivia' ? allData.trivia : allData.sales;
    if (!list || list.length === 0) return;

    const item = list[Math.floor(Math.random() * list.length)];
    const card = document.getElementById('trivia-card');
    
    // アニメーションをリセット（クラスを一度外して強制再描画）
    card.classList.remove('fancy-pop');
    void card.offsetWidth; 
    card.classList.add('fancy-pop');

    document.getElementById('item-title').innerText = item.タイトル || "無題";
    document.getElementById('item-content').innerText = item.内容 || "（内容なし）";
}

/**
 * 各種イベント
 */
document.querySelectorAll('.tab-item').forEach(tab => {
    tab.addEventListener('click', () => {
        const target = tab.dataset.target;
        document.querySelectorAll('.tab-item, .page').forEach(el => el.classList.remove('active'));
        tab.classList.add('active');

        if (target === 'write') {
            document.getElementById('write-page').classList.add('active');
        } else {
            currentTab = target;
            document.getElementById('page-title').innerText = (target === 'trivia' ? '今日の雑学' : '今日の営業');
            document.getElementById('view-page').classList.add('active');
            showRandomContent();
        }
    });
});

document.getElementById('next-btn').addEventListener('click', showRandomContent);

// 書き込み処理（既存のまま）
document.getElementById('submit-btn').addEventListener('click', async () => {
    const type = document.getElementById('post-type').value;
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;

    if (!title || !content) { alert("入力してください"); return; }

    const btn = document.getElementById('submit-btn');
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
            alert("登録しました！");
            document.getElementById('post-title').value = "";
            document.getElementById('post-content').value = "";
            await init();
        }
    } catch (e) {
        alert("エラーが発生しました");
    } finally {
        btn.innerText = "登録する";
        btn.disabled = false;
    }
});

init();
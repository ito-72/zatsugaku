let allData = { trivia: [], sales: [] };
let currentTab = 'trivia';

/**
 * 起動処理
 */
async function init() {
    const loader = document.getElementById('loading-screen');
    try {
        const res = await fetch('/api/get-data');
        allData = await res.json();
        if (allData.trivia.length > 0 || allData.sales.length > 0) {
            showRandomContent();
        }
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 800);
        }, 500);
    } catch (e) {
        loader.style.display = 'none';
    }
}

/**
 * 💡 華やかな表示処理：フラッシュ → 切り替え → パーティクルどん！
 */
function showRandomContent() {
    const list = currentTab === 'trivia' ? allData.trivia : allData.sales;
    if (!list || list.length === 0) return;

    const flash = document.getElementById('flash-overlay');
    const card = document.getElementById('trivia-card');
    const item = list[Math.floor(Math.random() * list.length)];

    // 1. まず画面を白くする（フラッシュ開始）
    flash.classList.remove('flash-active');
    void flash.offsetWidth; 
    flash.classList.add('flash-active');

    // 2. 画面が白くなった瞬間(0.15秒後)に内容を差し替える
    setTimeout(() => {
        document.getElementById('item-title').innerText = item.タイトル || "無題";
        document.getElementById('item-content').innerText = item.内容 || "（内容なし）";
        
        // カードのアニメーションをリセット
        card.classList.remove('fancy-pop');
        void card.offsetWidth;
        card.classList.add('fancy-pop');

        // 3. パーティクルを爆発させる！
        createBurst();
    }, 150);
}

/**
 * 💡 パーティクル生成：色とりどりの粒を飛ばす
 */
function createBurst() {
    const container = document.getElementById('particle-container');
    const colors = ['#a2c2e8', '#ffdeeb', '#ffffff', '#ffd166', '#06d6a0'];
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        
        // ランダムな色と飛び散る方向を設定
        const color = colors[Math.floor(Math.random() * colors.length)];
        const tx = (Math.random() - 0.5) * 400 + 'px'; // 左右に散る
        const ty = (Math.random() - 0.5) * 400 + 'px'; // 上下に散る
        
        p.style.backgroundColor = color;
        p.style.setProperty('--tx', tx);
        p.style.setProperty('--ty', ty);
        
        // アニメーション実行
        p.style.animation = `particleBurst ${0.4 + Math.random() * 0.4}s ease-out forwards`;
        
        container.appendChild(p);
        
        // 使い終わった要素は削除
        setTimeout(() => p.remove(), 1000);
    }
}

/**
 * イベント設定（既存のロジック）
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

// 書き込み（省略・以前と同じ）
document.getElementById('submit-btn').addEventListener('click', async () => {
    const type = document.getElementById('post-type').value;
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;
    if (!title || !content) return;
    const btn = document.getElementById('submit-btn');
    btn.disabled = true;
    try {
        const res = await fetch('/api/post-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, title, content })
        });
        const result = await res.json();
        if (result.status === 'success') { alert("登録完了！"); init(); }
    } catch (e) { alert("失敗"); } finally { btn.disabled = false; }
});

init();
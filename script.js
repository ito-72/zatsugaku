let allData = { trivia: [], sales: [] };
let currentTab = 'trivia';

// 💡 追加：直前のインデックスを保存する変数
let lastIndices = { trivia: null, sales: null };

/**
 * 起動処理
 */
async function init() {
    const loader = document.getElementById('loading-screen'); //[cite: 1]
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
 * 💡 表示処理：重複回避ロジックを追加
 */
function showRandomContent() {
    const list = currentTab === 'trivia' ? allData.trivia : allData.sales;
    if (!list || list.length === 0) return;

    let randomIndex;

    // 💡 ロジック：リストが2件以上ある場合、直前と同じにならないようループで回す
    if (list.length > 1) {
        do {
            randomIndex = Math.floor(Math.random() * list.length);
        } while (randomIndex === lastIndices[currentTab]);
    } else {
        randomIndex = 0;
    }

    // 今回選ばれたインデックスを保存[cite: 3]
    lastIndices[currentTab] = randomIndex;
    const item = list[randomIndex];

    const flash = document.getElementById('flash-overlay'); //[cite: 1]
    const card = document.getElementById('trivia-card'); //[cite: 1]

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
 * 💡 パーティクル生成
 */
function createBurst() {
    const container = document.getElementById('particle-container'); //[cite: 1]
    const colors = ['#a2c2e8', '#ffdeeb', '#ffffff', '#ffd166', '#06d6a0'];
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        
        const color = colors[Math.floor(Math.random() * colors.length)];
        const tx = (Math.random() - 0.5) * 400 + 'px'; 
        const ty = (Math.random() - 0.5) * 400 + 'px'; 
        
        p.style.backgroundColor = color;
        p.style.setProperty('--tx', tx);
        p.style.setProperty('--ty', ty);
        
        p.style.animation = `particleBurst ${0.4 + Math.random() * 0.4}s ease-out forwards`;
        
        container.appendChild(p);
        
        setTimeout(() => p.remove(), 1000);
    }
}

/**
 * イベント設定
 */
document.querySelectorAll('.tab-item').forEach(tab => {
    tab.addEventListener('click', () => {
        const target = tab.dataset.target;
        document.querySelectorAll('.tab-item, .page').forEach(el => el.classList.remove('active'));
        tab.classList.add('active');
        if (target === 'write') {
            document.getElementById('write-page').classList.add('active'); //[cite: 1]
        } else {
            currentTab = target;
            document.getElementById('page-title').innerText = (target === 'trivia' ? '今日の雑学' : '今日の営業');
            document.getElementById('view-page').classList.add('active'); //[cite: 1]
            showRandomContent();
        }
    });
});

document.getElementById('next-btn').addEventListener('click', showRandomContent); //[cite: 1]

/**
 * 書き込み処理
 */
document.getElementById('submit-btn').addEventListener('click', async () => {
    const type = document.getElementById('post-type').value;
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;
    
    if (!title || !content) {
        alert("タイトルと内容を入力してください");
        return;
    }

    const btn = document.getElementById('submit-btn');
    btn.disabled = true;
    
    try {
        const res = await fetch('/api/post-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, title, content })
        });
        const result = await res.json();
        if (result.status === 'success') { 
            alert("登録完了！"); 
            // フォームをクリア
            document.getElementById('post-title').value = '';
            document.getElementById('post-content').value = '';
            // データを再取得
            init(); 
        }
    } catch (e) { 
        alert("通信に失敗しました"); 
    } finally { 
        btn.disabled = false; 
    }
});

// 初期化実行
init();
// 1. 設定データ
const CATEGORIES = {
    seika: { 
        label: "青果", 
        keywords: ["りんご", "バナナ", "トマト", "キャベツ", "レタス", "ねぎ", "きのこ", "ほうれん草", "小松菜", "ブロッコリー", "きゅうり", "なす", "ピーマン", "大根", "人参", "玉ねぎ", "じゃがいも", "サツマイモ", "みかん", "ぶどう", "いちご", "桃", "梨"] 
    },
    seiniku: { 
        label: "精肉", 
        keywords: ["肉", "牛", "豚", "鶏", "ハム", "ひき肉", "ベーコン", "ソーセージ", "ウィンナー", "ステーキ", "バラ", "ロース", "モモ", "ササミ", "手羽", "レバー", "ミンチ"] 
    },
    senkyo: { 
        label: "鮮魚", 
        keywords: ["魚", "刺身", "鮭", "サバ", "マグロ", "海老", "貝", "あさり", "しじみ", "イカ", "タコ", "サンマ", "タイ", "ブリ", "カツオ", "干物", "しらす", "明太子", "たらこ"] 
    },
    daily: { 
        label: "日配", 
        keywords: ["牛乳", "卵", "納豆", "豆腐", "パン", "チーズ", "ヨーグルト", "バター", "マーガリン", "うどん", "そば", "ラーメン", "餃子の皮", "油揚げ", "練り物", "ちくわ", "カニカマ", "ジュース", "ゼリー"] 
    },
    grocery: { 
        label: "加工", 
        keywords: ["醤油", "みりん", "酒", "砂糖", "塩", "酢", "味噌", "油", "パスタ", "米", "小麦粉", "調味料", "菓子", "スナック", "チョコ", "カップ麺", "缶詰", "カレー", "ふりかけ", "お茶", "コーヒー", "炭酸水"] 
    },
    souzai: { 
        label: "惣菜", 
        keywords: ["弁当", "コロッケ", "揚げ物", "寿司", "サラダ", "天ぷら", "唐揚げ", "とんかつ", "ピザ", "サンドイッチ"] 
    },
    nonfood: { 
        label: "雑貨", 
        keywords: ["洗剤", "ティッシュ", "電池", "石鹸", "紙", "タオル", "シャンプー", "ラップ", "アルミホイル", "歯磨き", "掃除", "ゴミ袋"] 
    },
    others: { label: "その他", keywords: [] }
};
let stores = JSON.parse(localStorage.getItem('stores_v4')) || ["スーパーA", "薬局"];
let shoppingList = JSON.parse(localStorage.getItem('list_v4')) || [];
let userCustomDict = JSON.parse(localStorage.getItem('dict_v4')) || {};
let currentStore = stores[0];
let currentTab = 'seika';

function init() {
    renderStoreSelector();
    renderTabs();
    renderList();

    const nameInput = document.getElementById('itemInput');
    const unitInput = document.getElementById('unitInput');

    // 追加ボタンのクリック
    document.getElementById('addBtn').onclick = addItem;

    // Enterキーの監視（商品名と単位の両方の入力欄）
    [nameInput, unitInput].forEach(el => {
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                addItem();
            }
        });
    });

    document.getElementById('addStoreBtn').onclick = addNewStore;
    document.getElementById('storeSelect').onchange = (e) => {
        currentStore = e.target.value;
        renderList();
    };
}

function addItem() {
    const nameEl = document.getElementById('itemInput');
    const unitEl = document.getElementById('unitInput');
    const name = nameEl.value.trim();

    // ★ 何も入っていない（またはスペースのみ）場合は無効
    if (name === "") {
        console.log("入力が空のため追加をスキップしました");
        return;
    }

    const category = judgeCategory(name);
    shoppingList.push({
        id: Date.now().toString(),
        name,
        unit: unitEl.value.trim(),
        category,
        store: currentStore,
        completed: false
    });

    nameEl.value = ""; 
    unitEl.value = "";
    currentTab = category;
    saveAndReload();
    
    // 次の入力のためにフォーカスを戻す
    nameEl.focus();
}

// 判定・描画ロジック（前回の改良版を維持）
function judgeCategory(name) {
    if (userCustomDict[name]) return userCustomDict[name];
    for (const [id, data] of Object.entries(CATEGORIES)) {
        if (id === 'others') continue;
        if (data.keywords.some(key => name.includes(key))) return id;
    }
    return 'others';
}

function renderList() {
    const container = document.getElementById('listContainer');
    const filtered = shoppingList.filter(item => item.store === currentStore && item.category === currentTab);
    
    container.innerHTML = filtered.map(item => `
        <div class="item-row ${item.completed ? 'completed' : ''}" data-id="${item.id}">
            <input type="checkbox" ${item.completed ? 'checked' : ''} onchange="toggleComplete('${item.id}')">
            
            <div class="item-main">
                <span class="name-text">${item.name}</span>
                ${item.unit ? `<span class="unit-text">${item.unit}</span>` : ''}
            </div>

            <select class="learn-select" onchange="learnCategory('${item.id}', this.value)">
                ${Object.entries(CATEGORIES).map(([id, d]) => `<option value="${id}" ${item.category===id?'selected':''}>${d.label}</option>`).join('')}
            </select>
            
            <button class="delete-btn" onclick="deleteItem('${item.id}')">×</button>
        </div>
    `).join('') || '<div style="text-align:center;color:#ccc;padding:40px;">リストは空です</div>';

    Sortable.create(container, {
        animation: 150,
        handle: '.item-main',
        onEnd: saveOrder
    });
}

// --- 共通の補助関数 ---
function toggleComplete(id) {
    const i = shoppingList.find(x => x.id === id);
    if(i) i.completed = !i.completed;
    saveAndReload();
}
function deleteItem(id) {
    shoppingList = shoppingList.filter(x => x.id !== id);
    saveAndReload();
}
function learnCategory(id, newCat) {
    const i = shoppingList.find(x => x.id === id);
    if(i) {
        i.category = newCat;
        userCustomDict[i.name] = newCat;
        localStorage.setItem('dict_v4', JSON.stringify(userCustomDict));
        saveAndReload();
    }
}
function addNewStore() {
    const name = prompt("店の名前は？");
    if(name && !stores.includes(name)) {
        stores.push(name);
        currentStore = name;
        localStorage.setItem('stores_v4', JSON.stringify(stores));
        renderStoreSelector();
        renderList();
    }
}
function saveOrder() {
    const ids = Array.from(document.querySelectorAll('.item-row')).map(el => el.dataset.id);
    const others = shoppingList.filter(x => !(x.store === currentStore && x.category === currentTab));
    const sorted = ids.map(id => shoppingList.find(x => x.id === id));
    shoppingList = [...others, ...sorted];
    saveAndReload();
}
function renderStoreSelector() {
    document.getElementById('storeSelect').innerHTML = stores.map(s => `<option value="${s}" ${s===currentStore?'selected':''}>${s}</option>`).join('');
}
function renderTabs() {
    document.getElementById('tabContainer').innerHTML = Object.entries(CATEGORIES).map(([id, d]) => `<button class="tab-btn ${currentTab===id?'active' : ''}" onclick="switchTab('${id}')">${d.label}</button>`).join('');
}
function switchTab(id) { currentTab = id; renderTabs(); renderList(); }
function saveAndReload() {
    localStorage.setItem('list_v4', JSON.stringify(shoppingList));
    renderTabs(); renderList();
}

init();
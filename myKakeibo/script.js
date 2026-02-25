// 1. 【データ読み込み】保存されたデータがあれば読み込み
let expenseList = JSON.parse(localStorage.getItem("myExpenseData")) || [];

// 画面の部品を取得
const totalElement = document.getElementById("total-amount");
const addBtn = document.getElementById("add-btn");
const inputDate = document.getElementById("new-date");
const inputCategory = document.getElementById("new-category");
const inputTitle = document.getElementById("new-title");
const inputPrice = document.getElementById("new-price");
const expenseListArea = document.getElementById("expense-list");

// 2. 【グラフの初期設定】
const ctx = document.getElementById('myChart').getContext('2d');
const categories = ['食費', '交通費', '日用品', '娯楽', '住居費', 'その他'];
let myChart = new Chart(ctx, {
    type: 'pie',
    data: {
        labels: categories,
        datasets: [{
            data: [0, 0, 0, 0, 0, 0], // ここに後で集計データを入れる
            backgroundColor: ['#e74c3c', '#3498db', '#f1c40f', '#9b59b6', '#2ecc71', '#95a5a6']
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { labels: { color: 'white' } }
        }
    }
});

// 3. 【画面の表示・更新】
function updateDisplay() {
    expenseListArea.innerHTML = ""; 
    let total = 0;
    // グラフ用の集計
    let categoryTotals = [0, 0, 0, 0, 0, 0];

    // updateDisplay関数の中の expenseList.forEach 部分
expenseList.forEach((item, index) => { // index（番号）を受け取るように変更
    const li = document.createElement("li");
    li.innerHTML = `
        <div class="item-left">
            <small>${item.date} 【${item.category}】</small><br>
            <span>${item.title}</span>
        </div>
        <div class="item-right" style="text-align: right;">
            <span>¥${item.price.toLocaleString()}</span><br>
            <button class="delete-btn" onclick="deleteItem(${index})">削除</button>
        </div>
    `;
    expenseListArea.appendChild(li);
    
    total += item.price;
    const catIndex = categories.indexOf(item.category);
    if (catIndex !== -1) {
        categoryTotals[catIndex] += item.price;
    }
});

    // 画面の金額を更新
    totalElement.textContent = total.toLocaleString() + "円";

    // グラフのデータを更新して再描画
    myChart.data.datasets[0].data = categoryTotals;
    myChart.update();
}

// 最初に一度実行して保存データを表示
updateDisplay();

// 4. 【追加ボタン】
addBtn.addEventListener("click", () => {
    const date = inputDate.value;
    const category = inputCategory.value;
    const title = inputTitle.value;
    const price = Number(inputPrice.value);

    if (date === "" || title === "" || price === 0) {
        alert("すべて入力してください！");
        return;
    }

    // データを保存用配列に追加
    const newItem = { date, category, title, price };
    expenseList.push(newItem);

    // ローカルストレージに保存
    localStorage.setItem("myExpenseData", JSON.stringify(expenseList));

    // 画面とグラフを更新
    updateDisplay();

    // 入力欄をクリア
    inputDate.value = "";
    inputTitle.value = "";
    inputPrice.value = "";
});

// データを削除する関数（script.jsの一番下などに追加）
function deleteItem(index) {
    if (confirm("この記録を削除してもよろしいですか？")) {
        // 1. 配列から指定した番号のデータを1つ消す
        expenseList.splice(index, 1);

        // 2. 消した後の最新データをローカルストレージに保存し直す
        localStorage.setItem("myExpenseData", JSON.stringify(expenseList));

        // 3. 画面（リスト、合計、グラフ）を全部更新する
        updateDisplay();
    }
}
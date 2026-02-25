 
const todoForm = document.getElementById('todo-form');//form
const input = document.getElementById('todo-input');//text area
const addBtn = document.getElementById('add-btn');//add botton
const todoList = document.getElementById('todo-list');//

todoForm.addEventListener('submit', (event) => {
    event.preventDefault(); 
    console.log(event);
    const taskText = input.value;

    if (taskText === "") {
        alert("文字を入力してください");
        return; 
    }

    // --- ここから改造 ---

    // ① 親となるリスト項目(li)を作る
    const li = document.createElement('li');

    // ② チェックボックスを作る
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox'; // <input type="checkbox"> にする

    // ③ テキストを入れる箱(span)を作る
    const span = document.createElement('span');
    span.textContent = taskText;

    // ④ チェックボックスが押された時の動きを予約する
    checkbox.addEventListener('change', () => {
    // li全体に「完了したよ」という目印（クラス）をつけたり外したりする
    li.classList.toggle('completed', checkbox.checked);
});

   
    // 削除ボタンを「生成」する
    const deleteBtn = document.createElement('button');

    // ボタンの「見た目（文字）」を決める
    deleteBtn.textContent = '削除';

    deleteBtn.addEventListener('click', () => {
        li.remove();
    });

  // ⑤ li の中に「チェック」と「文字」を合体させる
    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);

    // ⑥ 画面のリストに追加する
    todoList.appendChild(li);

    // ボタンに「クリックされた時の動き」を予約する
    deleteBtn.addEventListener('click', () => {

    // 自分自身の親である li を削除する魔法の言葉
    li.remove();
     });

    input.value = "";
});
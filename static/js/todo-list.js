const addTask = document.querySelector('.add');
const list = document.querySelector('.todos');
const search = document.querySelector('.search input');
const detail = document.querySelector('.todo-detail');
// const search = $('.search');
const PAGE_SIZE = 20;
let index = 0;

const defaultCallback = () => {
    return function() {
        let res = JSON.parse(this.response);
        switch (this.status) {
            case 200:
                $('.todo-list > .alert').hide();
                tasks = res.data;
                addTodoList(tasks);                
                break;
        
            default:
                let alert = $('.todo-list > .alert');
                alert.removeClass(function(index, className) {
                    return (className.match(/\balert-\S+/g) || []).join(' ');
                });
                alert.addClass(res['alert_type']);
                alert.show();
                alert.html(res.message);
                break;
        }
    }
}

const getTasks = (callback, status=0, project_id='') => {
    let xhttp = new XMLHttpRequest();
    xhttp.onload = callback;
    // xhttp.onerror = function() {
    //   // do something
    // }
    xhttp.open("GET", `/todo?page_size=${PAGE_SIZE}&index=${index++}&status=${status}&project_id=${project_id}`, true);
    xhttp.send();   
}

(function(){
    // TODO ここasync awaitで受け取った方がよきかも
    // let callback = function() {
    //     let tasks = JSON.parse(this.response);
    //     tasks = tasks.data;
    //     addTodoList(tasks);
    // }
    getTasks(defaultCallback());
})();

// const saveTaskToLocalStorage = (task, html) => {
//     // null は、localStorage に保存しない
//     if(html){
//         // localStorage は、0 から始まる
//         localStorage.setItem(task, html);
//         return;
//     }
//     return;
// }

// const deleteTaskFromLocalStorage = task => {
//     localStorage.removeItem(task);
//     return;
// }

const addTodoList = tasks => {
    tasks.forEach(task => {
        // console.log(task)
        
        if (task['todo']) {
            let li = createTodoList(task['todo'], task['id']);
            list.appendChild(li);
            // detail.innerHTML += task['detail'];
        }       
    });
}

const createTodoList = (task, id) => {
    // HTML テンプレートを生成
    // const html = `
    // <li class="list-group-item d-flex justify-content-between align-items-center">
    //     <input type="checkbox">
    //     <span>${task}</span>
    //     <i class="far fa-trash-alt delete"></i>
    // </li>
    // `;

    // const html = `
    // <li id=${id} class="list-group-item d-flex justify-content-between align-items-center">
    //     <span><input type="checkbox"> ${task}</span>
    // </li>
    // `;

    // list.innerHTML += html;

    let li = document.createElement('li');
    // let span = document.createElement('span');
    // let input = document.createElement('input');

    li.className = 'list-group-item d-flex justify-content-between align-items-center'
    li.setAttribute('id', id);
    li.innerHTML = task;
    // input.setAttribute('type', 'checkbox');
    // span.appendChild(input);
    // span.innerHTML = task;
    // li.appendChild(span);

    return li;
    // ########## 追加 ###########
    // saveTaskToLocalStorage(task, html); 
}

addTask.addEventListener('submit', e => {
    // デフォルトのイベントを無効
    e.preventDefault();

    // タスクに入力した値を空白を除外して格納
    const task = addTask.add.value.trim();
    if(task.length) {
        let xhttp = new XMLHttpRequest();
        xhttp.onload = function() {
            // do something
            let res = JSON.parse(xhttp.response);
            switch (xhttp.status) {
                case 201:
                    $('.todo-list > .alert').hide();
                    // Todo List の HTML を作成
                    let li = createTodoList(res['data']['todo'], res['data']['id']);
                    list.insertBefore(li, list.children[0]);
                    // タスクに入力した文字をクリア
                    addTask.reset();
                    let ele = document.getElementById(res['data']['id']); // 移動させたい位置の要素を取得
                    let rect = ele.getBoundingClientRect();
                    let position = rect.top;    // 一番上からの位置を取得
                    list.scrollTo({
                        top: position,
                        left: 0,
                        behavior: 'smooth'
                    });                    
                    break;         
                default: // 失敗時の処理本当はステータスコードで分けたほうがいいかもだけど今は同じことするからdefaultにする
                    let alert = $('.todo-list > .alert');
                    alert.removeClass(function(index, className) {
                        return (className.match(/\balert-\S+/g) || []).join(' ');
                    });
                    alert.addClass(res['alert_type']);
                    alert.show();
                    let message_text = ''
                    for (const [key, value] of Object.entries(res.message)) {
                        value.forEach(message => {
                            message_text += `${key}: ${message}<br>`;
                        })
                        alert.html(message_text);
                    }
                    break;
            }
        }
        // xhttp.onerror = function() {
        //   console.log('error');
        // }
        xhttp.open("POST", '/todo/new', true);
        xhttp.setRequestHeader('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
        xhttp.send(`task=${task}`);       
    }
});

// 削除機能
// list.addEventListener('click', e => {
//     if (e.target.classList.contains('delete')){
//         e.target.parentElement.remove();
//         // ########## 追加 ###########
//         const task = e.target.parentElement.textContent.trim()
//         deleteTaskFromLocalStorage(task);
//     }
// });

// const filterTasks = (term) => {

//     Array.from(list.children)
//         .filter((todo) => !todo.textContent.toLowerCase().includes(term))
//         .forEach((todo) => todo.classList.add('filtered'));

//     Array.from(list.children)
//         .filter((todo) => todo.textContent.toLowerCase().includes(term))
//         .forEach((todo) => todo.classList.remove('filtered'));
// };

// search.addEventListener('keyup', () => {
//     // 空白削除かつ、小文字に変換(大文字・小文字の区別をなくす)
//     const term = search.value.trim().toLowerCase();
//     filterTasks(term);
// });

list.addEventListener('click', (e) => {
    // デフォルトのイベントを無効
    e.preventDefault();
    if(e.target && e.target.nodeName == "LI") {
        let id = e.target.id;
        //TODO ここはgetTodoDetailの成否見てから実行したほうが良さそう
        let prev = `li[id="${global_todo_id}"]`;
        let selected = `li[id="${id}"]`;
        console.log(prev);
        console.log(selected);
        $(prev).removeClass('selected');
        $(selected).addClass('selected');
        getTodoDetail(id);
    }
});

list.addEventListener("scroll", (e) => {
    //スクロールが末尾に達した
    if (e.target.scrollTop + e.target.clientHeight + 1 >= e.target.scrollHeight) {
        // this.dataset.lastnum = parseInt(this.dataset.lastnum) + 1;
        // let img = document.createElement('img');
        // img.src =  this.dataset.lastnum +'.jpg';
        // this.appendChild(img);
        console.log('scrolled');
        // let callback = function() {
        //     let tasks = JSON.parse(this.response);
        //     tasks = tasks.data;
        //     addTodoList(tasks);
        // }
        getTasks(defaultCallback());
    }
});

$('.search').click(function( e ) {
    e.preventDefault();
    let status = $('div[id="todo-list-status-select"] select').val();
    let project_id = $('div[id="todo-list-project-select"] select').val();
    // let callback = function() {
    //     let tasks = JSON.parse(this.response);
    //     tasks = tasks.data;
    //     addTodoList(tasks);
    // }
    list.innerHTML = '';
    index = 0;
    getTasks(defaultCallback(), status, project_id);
});
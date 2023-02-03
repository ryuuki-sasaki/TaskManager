const addTask = document.querySelector('.add');
const list = document.querySelector('.todos');
const search = document.querySelector('.search input');
const detail = document.querySelector('.todo-detail');
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
                const selected_task = $('.todos li.selected');
                if (tasks.length > 0 && selected_task.length === 0) {
                    const first_task = $('.todos li:first');
                    const first_task_id = first_task.attr('id');
                    first_task.addClass('selected');
                    getTodoDetail(first_task_id);
                } 
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
    xhttp.open("GET", `/todo?page_size=${PAGE_SIZE}&index=${index++}&status=${status}&project_id=${project_id}`, true);
    xhttp.send();   
}

window.onload = () => {
    getTasks(defaultCallback());
}

const addTodoList = tasks => {
    tasks.forEach(task => {
        if (task['todo']) {
            let li = createTodoList(task['todo'], task['id']);
            list.appendChild(li);
        }       
    });
}

const createTodoList = (task, id) => {
    let li = document.createElement('li');

    li.className = 'list-group-item d-flex justify-content-between align-items-center'
    li.setAttribute('id', id);
    li.innerHTML = task;

    return li;
}

addTask.addEventListener('submit', e => {
    // デフォルトのイベントを無効
    e.preventDefault();

    // タスクに入力した値を空白を除外して格納
    const task = addTask.add.value.trim();
    if(task.length) {
        let xhttp = new XMLHttpRequest();
        xhttp.onload = function() {
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
        xhttp.open("POST", '/todo/new', true);
        xhttp.setRequestHeader('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
        xhttp.send(`task=${encodeURIComponent(task)}`);       
    }
});

list.addEventListener('click', (e) => {
    // デフォルトのイベントを無効
    e.preventDefault();
    if(e.target && e.target.nodeName == "LI") {
        let id = e.target.id;
        //selectedになっているリストのIDを取得
        const prev_selected_id = $('.todos li.selected').attr('id');
        let prev = `li[id="${prev_selected_id}"]`;
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
        console.log('scrolled');
        getTasks(defaultCallback());
    }
});

$('.search').click(function( e ) {
    e.preventDefault();
    let status = $('div[id="todo-list-status-select"] select').val();
    let project_id = $('div[id="todo-list-project-select"] select').val();
    list.innerHTML = '';
    index = 0;
    getTasks(defaultCallback(), status, project_id);
});
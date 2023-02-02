const update = document.querySelector('.update');
let simplemde = new SimpleMDE({ 
    element: document.getElementById("mde"),
    toolbar: [
        "bold",
        "italic",
        "strikethrough",
        "heading",
        "heading-smaller",
        "heading-bigger",
        "heading-1",
        "heading-2",
        "heading-3",
        "code",
        "quote",
        "unordered-list",
        "ordered-list",
        "clean-block",
        "link",
        "image",
        "table",
        "horizontal-rule",
        "preview",
        "side-by-side",
        "fullscreen",
        "guide",
    ],
});
const mdSwitch = document.getElementById('switch');

let gTimer
// 入力中、0.7秒間入力がなければ、入力内容をローカルストレージに保存
simplemde.codemirror.on('inputRead', (e) => {
    if(gTimer){clearTimeout(gTimer);}
    console.log(gTimer);
    gTimer = setTimeout(saveInputToLocalStorage, 700);
})

// 入力完了後入力内容をローカルストレージに保存
const saveInputToLocalStorage = () => {
    const selected_todo_id = $('.todos li.selected').attr('id');
    const status = $('div[id="todo-detail-status-select"] select').val();
    const project_id = $('div[id="todo-detail-project-select"] select').val();
    const start_datetime = $('input[id="start-datetime"]').val();
    const end_datetime = $('input[id="end-datetime"]').val();
    const progress_rate = $('.progress-rate select').val();
    const save_item = {
        text: simplemde.value(),
        status: status,
        project_id: project_id,
        start_datetime: start_datetime,
        end_datetime: end_datetime,
        progress_rate: progress_rate,
    }
    localStorage.setItem(selected_todo_id, JSON.stringify(save_item));
}

const clearLocalStorageItem = itemKey => {
    localStorage.removeItem(itemKey);
}

// TODO submitでうまくいかない理由(e.preventDefault();してるのに元画面にリダイレクトしてしまう)
update.addEventListener('click', (e) => {
    const selected_id = $('.todos li.selected').attr('id');
    if (!selected_id) {
        return alert("タスクを選択してください。");
    }
    // console.log("detail clicked");
    // console.log(global_todo_id);
    // デフォルトのイベントを無効
    e.preventDefault();
    let text = simplemde.value();
    let status = $('div[id="todo-detail-status-select"] select').val();
    let project_id = $('div[id="todo-detail-project-select"] select').val();
    let start_datetime = $('input[id="start-datetime"]').val();
    let end_datetime = $('input[id="end-datetime"]').val();
    let progress_rate = $('.progress-rate select').val();
    console.log(start_datetime);
    let xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
        let res = JSON.parse(xhttp.response);
        let alert = $('.todo-detail > .alert');
        let message_text = ''
        alert.removeClass(function(index, className) {
            return (className.match(/\balert-\S+/g) || []).join(' ');
        });
        alert.addClass(res['alert_type']);
        alert.show();
        switch (xhttp.status) {
            case 200:
                alert.html(res['message']);
                setTimeout(function() {
                    alert.hide('slow');
                }, 5000);
                clearLocalStorageItem(selected_id);
                break;
            default:
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
    //   // do something
    // }
    xhttp.open("POST", `/todo/${selected_id}/detail/update`, true);
    xhttp.setRequestHeader('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
    xhttp.send(`text=${encodeURIComponent(text)}&status=${status}&project_id=${project_id}&start_datetime=${start_datetime}&end_datetime=${end_datetime}&progress_rate=${progress_rate}`); 
});

const getTodoDetail = id => {
    // localStorageに値が存在すればそいつセットなければ今の値をlocalStorageにセット
    const local_storage_saved_item = localStorage.getItem(id);
    const alert = $('.todo-detail > .alert');
    alert.hide();
    if (local_storage_saved_item) {
        // localにステータスとプロジェクトを保存してセット
        const local_storage_saved_item_obj = JSON.parse(local_storage_saved_item);
        $('div[id="todo-detail-status-select"] select').val(local_storage_saved_item_obj.status);
        $('div[id="todo-detail-project-select"] select').val(local_storage_saved_item_obj.project_id);
        $('input[id="start-datetime"]').val(local_storage_saved_item_obj.start_datetime);
        $('input[id="end-datetime"]').val(local_storage_saved_item_obj.end_datetime);
        $('.progress-rate select').val(local_storage_saved_item_obj.progress_rate);
        $('.selectpicker').selectpicker('refresh');
        simplemde.value(local_storage_saved_item_obj.text);
    } else {
        let xhttp = new XMLHttpRequest();
        xhttp.onload = function() {
            // do something
            let res = JSON.parse(xhttp.response);
            console.log(xhttp.status)
            console.log(res)
            switch (xhttp.status) {
                case 200:
                    $('div[id="todo-detail-status-select"] select').val(res['data']['status']);
                    $('div[id="todo-detail-project-select"] select').val(res['data']['project_id']);
                    $('input[id="start-datetime"]').val(res['data']['start_datetime']);
                    $('input[id="end-datetime"]').val(res['data']['end_datetime']);
                    $('.progress-rate select').val(res['data']['progress_rate']);
                    $('.selectpicker').selectpicker('refresh');
                    simplemde.value(res['data']['detail']);
                    break;
            
                default:
                    alert.removeClass(function(index, className) {
                        return (className.match(/\balert-\S+/g) || []).join(' ');
                    });
                    alert.addClass(res['alert_type']);
                    alert.show();
                    alert.html(res.message);
                    break;
            }
        }
        // xhttp.onerror = function() {
        //   // do something
        // }
        xhttp.open("GET", `/todo/${id}/detail`, true);
        xhttp.send();
    }
    // global_todo_id = id;
}

const clearTodoDetail = () => {
    simplemde.value('');
}

(function(){
    simplemde.togglePreview();
})();



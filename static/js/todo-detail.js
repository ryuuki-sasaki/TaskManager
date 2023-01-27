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

// TODO submitでうまくいかない理由(e.preventDefault();してるのに元画面にリダイレクトしてしまう)
update.addEventListener('click', (e) => {
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
    const selected_id = $('.todos li.selected').attr('id');
    xhttp.open("POST", `/todo/${selected_id}/detail/update`, true);
    xhttp.setRequestHeader('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
    xhttp.send(`text=${text}&status=${status}&project_id=${project_id}&start_datetime=${start_datetime}&end_datetime=${end_datetime}&progress_rate=${progress_rate}`); 
});

const getTodoDetail = (prev_selected_id, id) => {
    // localStorageに値が存在すればそいつセットなければ今の値をlocalStorageにセット
    let text = localStorage.getItem(id + '_text');
    let status = localStorage.getItem(id + '_status');
    let project_id = localStorage.getItem(id + '_project_id');
    let start_datetime = localStorage.getItem(id + '_start_datetime');
    let end_datetime = localStorage.getItem(id + '_end_datetime');
    let progress_rate = localStorage.getItem(id + '_progress_rate');

    let prev_status = $('div[id="todo-detail-status-select"] select').val();
    let prev_project_id = $('div[id="todo-detail-project-select"] select').val();
    let prev_start_datetime = $('input[id="start-datetime"]').val();
    let prev_end_datetime = $('input[id="end-datetime"]').val();
    let prev_progress_rate = $('.progress-rate select').val();
    localStorage.setItem(prev_selected_id + '_text', simplemde.value());
    localStorage.setItem(prev_selected_id + '_status', prev_status);
    localStorage.setItem(prev_selected_id + '_project_id', prev_project_id);
    localStorage.setItem(prev_selected_id + '_start_datetime', prev_start_datetime);
    localStorage.setItem(prev_selected_id + '_end_datetime', prev_end_datetime);
    localStorage.setItem(prev_selected_id + '_progress_rate', prev_progress_rate);
    let alert = $('.todo-detail > .alert');
    alert.hide();
    if (text !== null || status !== null || project_id !== null || 
        start_datetime !== null || end_datetime !== null || progress_rate !== null) {
        // localにステータスとプロジェクトを保存してセット
        $('div[id="todo-detail-status-select"] select').val(status);
        $('div[id="todo-detail-project-select"] select').val(project_id);
        $('input[id="start-datetime"]').val(start_datetime);
        $('input[id="end-datetime"]').val(end_datetime);
        $('.progress-rate select').val(progress_rate);
        $('.selectpicker').selectpicker('refresh');
        simplemde.value(text);
    } else {
        let xhttp = new XMLHttpRequest();
        xhttp.onload = function() {
            // do something
            let res = JSON.parse(xhttp.response);
            console.log(xhttp.status)
            console.log(res)
            switch (xhttp.status) {
                case 200:
                    text = res['data']['detail'];
                    status = res['data']['status'];
                    project_id = res['data']['project_id'];
                    start_datetime = res['data']['start_datetime'];
                    end_datetime = res['data']['end_datetime'];
                    progress_rate = res['data']['progress_rate'];
                    $('div[id="todo-detail-status-select"] select').val(status);
                    $('div[id="todo-detail-project-select"] select').val(project_id);
                    $('input[id="start-datetime"]').val(start_datetime);
                    $('input[id="end-datetime"]').val(end_datetime);
                    $('.progress-rate select').val(progress_rate);
                    $('.selectpicker').selectpicker('refresh');
                    simplemde.value(text);
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



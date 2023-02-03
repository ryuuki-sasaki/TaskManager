function getProjects(callback) {
    let xhttp = new XMLHttpRequest();
    xhttp.onload = callback;
    xhttp.open("GET", `/project`, true);
    xhttp.send();     
}

function setProjects() {
    console.log($('div[id$="project-select"] select'));
    let callback = function () {
        let projects = JSON.parse(this.response);
        projects.data.forEach(project => {
            $('div[id$="project-select"] select').append(`<option value="${project['id']}">${project['name']}</option>`);
            $('.selectpicker').selectpicker('refresh');
        });   
    }
    $('div[id$="project-select"] select').children().remove();
    $('div[id$="project-select"] select').append('<option value="">--</option>');
    getProjects(callback);   
}

$('button[id="send-project"]').click(function( e ) {
    console.log('send project click');
    e.preventDefault();
    let name = $("#project-name").val();
    //jqueyスリムビルド使用のためXMLHttpRequest使用
    let xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
        let res = JSON.parse(xhttp.response);
        switch (xhttp.status) {
            case 201:
                let modal = $('#add-project-modal')
                modal.find('.alert').hide();
                modal.modal('hide');
                setProjects();
                break;
            default: // 失敗時の処理本当はステータスコードで分けたほうがいいかもだけど今は同じことするからdefaultにする
                let alert = $('#add-project-modal').find('.alert');
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
    xhttp.open("POST", '/project/new', true);
    xhttp.setRequestHeader('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
    xhttp.send(`name=${name}`); 
});

$(function(){
    console.log('inport project.js');
    setProjects();
});

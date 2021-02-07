function getProjects(callback) {
    let xhttp = new XMLHttpRequest();
    xhttp.onload = callback;
    // xhttp.onerror = function() {
    //   // do something
    // }
    xhttp.open("GET", `/project`, true);
    xhttp.send();     
}

// const getProjects = (callback) => {
//     let xhttp = new XMLHttpRequest();
//     xhttp.onload = callback;
//     // xhttp.onerror = function() {
//     //   // do something
//     // }
//     xhttp.open("GET", `/project`, true);
//     xhttp.send();   
// }

// document radyのタイミングでやればいい？
function setProjects() {
    console.log($('div[id$="project-select"] select'));
    let callback = function () {
        // console.log(this.response);
        let projects = JSON.parse(this.response);
        projects.data.forEach(project => {
            // $(`.${parts}-project-select select`).append(`<option value="${project['id']}">${project['name']}</option>`);
            // $=でXXXproject-selectの形になってればいい(XXXはなんもいい)
            $('div[id$="project-select"] select').append(`<option value="${project['id']}">${project['name']}</option>`);
            $('.selectpicker').selectpicker('refresh');
            // $('div[id="project-select"] select').append(`<option value="${project['id']}">${project['name']}</option>`);
        });   
    }
    // $(`.${parts}-project-select select`).children().remove();
    // $(`.${parts}-project-select select`).append('<option value="">--</option>');
    $('div[id$="project-select"] select').children().remove();
    // $('div[id="project-select"] select').children().remove();
    $('div[id$="project-select"] select').append('<option value="">--</option>');
    // $('div[id="project-select"] select').append('<option value="">--</option>');
    getProjects(callback);   
}

// const setProjects = () => {
//     let callback = function () {
//         console.log(this.response);
//         let projects = JSON.parse(this.response);
//         projects.data.forEach(project => {
//             $(".project-select select").append(`<option value="${project['id']}">${project['name']}</option>`);
//         });   
//     }
//     $('.project-select select').children().remove();
//     $('.project-select select').append('<option value="">--</option>');
//     getProjects(callback);
// }

// $(`.${parts}-send-project`).click(function( e ) {
$('button[id="send-project"]').click(function( e ) {
// $(document).on('click', '#send-project', function( e ) {
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
    // xhttp.onerror = function() {
    //   // do something
    // }
    xhttp.open("POST", '/project/new', true);
    xhttp.setRequestHeader('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
    xhttp.send(`name=${name}`); 
});

// $(document).click(function(event){
// 	var target = $(event.target);
// 	console.log(target);
// });

$(function(){
    console.log('inport project.js');
    setProjects();
});

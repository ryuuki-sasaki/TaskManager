$(function(){
    console.log('start');
    setInterval(function(){
        $('.box').toggleClass('color-red');
        $('.box').click();
        console.log('interval');
    },1000);
});

$('.box').click(function( e ) {
    e.preventDefault();
    console.log("clicked");
});
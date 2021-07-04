$(document).ready(function(){
    $('p code').each(function(i,inline){
        hljs.highlightBlock(inline);
    })
})
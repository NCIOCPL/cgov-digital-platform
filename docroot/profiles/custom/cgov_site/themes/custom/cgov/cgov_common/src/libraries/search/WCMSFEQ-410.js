import $ from 'jquery';

var patch = () => {
    const form = $("#resultForm");
    const paginationLinks = form.find(".pagination a");

    if(paginationLinks[0]) {
        paginationLinks.each(function(el,i){
            let $this = $(this);
            let href= $this.attr('href');
            if(href.match("javascript")){
                $this.attr('href','#');
                const index = href.replace("javascript:page('","").replace("');","");

                $this.click(function(e){
                    e.preventDefault();
                    document.searchParamForm.selectedPage.value=index;
                    document.searchParamForm.action='/about-cancer/causes-prevention/genetics/directory/results';
                    document.searchParamForm.submit();
                })
            }
        });
    }
}
export default patch;
import $ from 'jquery';
import './PDQ.scss';

const onDOMContentLoaded = () => {
    // move health professional/patient toggle up to article head
    $('.pdq-hp-patient-toggle').detach().insertAfter('h1');

    // creates the table of contents for the individual sections based on the h3 contained within the section
    function buildSectionTOC(sectionNode) {
        let $sectionNode = $(sectionNode);
        let $nav = $('<nav>').addClass('in-this-section').attr('role', 'navigation').append($('<h6>In This Section</h6><ul></ul>'));
        $sectionNode.find('h3').each(function(){
            let $this = $(this);
            $nav.find('ul').append($('<li><a href="#' + $this.attr('id') + '">' + $this.html()+ '</a></li>'));
        });
        $nav.insertAfter( $sectionNode.find('h2') );
    }

    // parse PDQ sections for need for section TOC
    $('#cgvBody section').each(function(){
        if($(this).find('h3').length > 1){
            buildSectionTOC(this);
        }
    })
}

document.addEventListener('DOMContentLoaded',onDOMContentLoaded);
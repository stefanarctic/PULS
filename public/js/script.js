
// Disable scrollbar

const toggleOverflow = () => {
    if(document.body.style.overflow === 'hidden')
        document.body.style.overflow = '';
    else
        document.body.style.overflow = 'hidden';
}

document.addEventListener('keydown', e => {
    if(e.ctrlKey && e.key === 'k')
    {
        toggleOverflow();
    }
})


$(document).ready(() => {

    // Add shadow and blur effect to header when page is scrolled
    if($(this).scrollTop() > 100)
    {
        $('nav').css('backdrop-filter', 'blur(2px)');
        $('nav').css('background', 'linear-gradient(to bottom, rgba(0, 0, 0, 0.74), rgba(0, 0, 0, 0))');
    }
    
    // Sets up the navbar links for proper scrolling on click
    const navLinks = document.querySelectorAll("#nav-list li a");
    navLinks.forEach(a => {
        a.addEventListener('click', e => {
            openURL(e.target);
        })
    })
    navLinks[0].addEventListener('click', e => {
        const header = document.querySelector('header');
        header.scrollIntoView(true);
    })
})

const openURL = linkElement => {
    const linkId = linkElement.dataset.href.split('#').join('');

    // const sections = document.querySelectorAll('section');
    // for(let i = 0; i < sections.length; i++)
    // {
    //     if(sections[i].id === linkId)
    //     {
    //         if(i + 1 === sections.length)
    //         {
    //             sections[i].scrollIntoView(false);
    //             return;
    //         }
    //         sections[i + 1].scrollIntoView(true);
    //     }
    // }

    const openedSection = document.getElementById(linkId);
    // const sectionRect = openedSection.getBoundingClientRect();
    // const top = sectionRect.y;
    // const height = sectionRect.height;
    // window.scrollTo(0, top - (height / 2));

    // window.scrollTo(0, top);
    openedSection.scrollIntoView(false);
    // window.scrollTo(0, top);
    // window.scrollTo()
    console.log(`Scrolled to ${openedSection.id}`);
}

// Change header on scroll
$(document).scroll(() => {
    if($(this).scrollTop() <= 100)
    {
        $('nav').css('backdrop-filter', `blur(${0.2 * ($(this).scrollTop() / 10)}px)`);
        $('nav').css('background', `linear-gradient(to bottom, rgba(0, 0, 0, ${$(this).scrollTop() / 100 * 0.74}), rgba(0, 0, 0, 0))`);
    }
    else
    {
        $('nav').css('backdrop-filter', 'blur(2px)');
        $('nav').css('background', 'linear-gradient(to bottom, rgba(0, 0, 0, 0.74), rgba(0, 0, 0, 0))');
    }
})


function getRootElementFontSize() {
    // Returns a number
    return parseFloat(
      // of the computed font-size, so in px
      getComputedStyle(
        // for the root <html> element
        document.documentElement
      ).fontSize
    );
}
  
function convertRem(value) {
    return value * getRootElementFontSize();
}

setTimeout(() => {
    // convertRem(2); // 32 (px)
    console.log(convertRem(3.3));
},1000);
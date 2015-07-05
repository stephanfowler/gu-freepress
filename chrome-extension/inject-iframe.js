var thisUrl = window.location.href, 

    domain = 'localhost:5000',
    //domain = 'quiet-island-1381.herokuapp.com',

    url = '//' + domain + '/?parentUrl=' + thisUrl;

[
    {
        rx: /theguardian\.com|localhost/,
        targetSelector: '.content__secondary-column .js-mpu-ad-slot',
        position: 'beforebegin',
        hideableSelector: '.top-banner-ad-container'
    },
    {
        rx: /telegraph\.co\.uk/,
        targetSelector: '.oneThird',
        position: 'afterbegin',
        hideableSelector: null
    },
    {
        rx: /buzzfeed\.com/,
        targetSelector: '.Column2',
        position: 'afterbegin',
        hideableSelector: null
    },
    {
        rx: /bbc\.co\.uk/,
        targetSelector: '.column--secondary',
        position: 'afterbegin',
        hideableSelector: null
    }

].forEach(function (spec) {
    var targetEl,
        hideableEl;

    if (thisUrl.match(spec.rx)) {
        targetEl = document.querySelector(spec.targetSelector);
        hideableEl = document.querySelector(spec.hideableSelector);

        if (hideableEl) {
            hideableEl.parentNode.removeChild(hideableEl);
        }

        if (targetEl) {
            targetEl.insertAdjacentHTML(spec.position, '<iframe src="' + url + '" style="border: 0; display: block; height:710px; overflow:hidden; background:#fff;"></iframe>')
        }
    }
});

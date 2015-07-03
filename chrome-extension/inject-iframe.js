var thisUrl = window.location.href, 

    //domain = 'localhost:5000',
    domain = 'quiet-island-1381.herokuapp.com',

    url = '//' + domain + '/?parentUrl=' + thisUrl;

[
    {
        rx: /guardian|localhost/,
        targetSelector: '.content__secondary-column .js-mpu-ad-slot',
        position: 'beforebegin',
        hideableSelector: '.top-banner-ad-container'
    },
    {
        rx: /telegraph/,
        targetSelector: '.oneThird',
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
            targetEl.insertAdjacentHTML(spec.position, '<iframe src="' + url + '" style="border: 0; float:left; clear:left; width:100%; height:600px; margin: 0 0 72px 0; background:#fff;"></iframe>')
        }
    }
});

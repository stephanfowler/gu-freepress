var thisUrl = window.location.href, 

    domain = 'localhost:5000',
    //domain = 'quiet-island-1381.herokuapp.com',

    targetSelector = '.content__secondary-column .js-mpu-ad-slot',
    hideableSelector = '.top-banner-ad-container',

    isGuPage = thisUrl.match(/theguardian\.com|localhost/),
    url = '//' + domain + '/?asGuPopup=' + (isGuPage ? '' : '1') + '&parentUrl=' + thisUrl,
    targetEl,
    hideableEl;

if (isGuPage) {
    targetEl = document.querySelector(targetSelector);
    hideableEl = document.querySelector(hideableSelector);

    if (hideableEl) {
        hideableEl.parentNode.removeChild(hideableEl);
    }

    if (targetEl) {
        targetEl.insertAdjacentHTML('beforebegin', '<iframe src="' + url + '" style="border: 0; display: block; height:720px; overflow:hidden; background:#fff;"></iframe>')
    }
} else {
    url += '&gu=1';

    document.body.insertAdjacentHTML('beforeend', 
        '<iframe src="' + url + '" style="' +
            'border: 0;' +
            'background: #fff;' +
            'padding: 10px;' +
            'box-shadow: 0px 0px 35px black;' +
            'z-index: 50000;' +
            'position: fixed;' +
            'top: 20px;' +
            'right: 20px;' +
            'height: 120px;' +
            'overflow: hidden;' +
        '"></iframe>'
    );
}

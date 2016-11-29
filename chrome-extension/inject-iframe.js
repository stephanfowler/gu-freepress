console.log('Free Press: running');

var thisUrl = window.location.href, 

    domain = 'https://quiet-island-1381.herokuapp.com',
    //domain = 'localhost:5000',

    isGuPage   = thisUrl.match(/theguardian\.com|localhost/),
    isBBCPage   = thisUrl.match(/bbc\.co\.uk/),
    isOtherPage = !isGuPage && !isBBCPage,
    title = isGuPage ? 'Guardian' : isBBCPage ? 'BBC' : '',

    iframeSrc  = domain + '/?asGuPopup=' + (isOtherPage ? '1' : '') + '&title=' + title + '&parentUrl=' + thisUrl,
    iframeEmbedHtml = '<iframe src="' + iframeSrc + '" style="border: 0; display: block; height:720px; overflow:hidden; background:#fff;"></iframe>',

    popupCheckUrl = domain + '/api/show-popup?parentUrl=' + thisUrl,

    targetEl,
    hideableEl;

if (isGuPage) {
    targetEl = document.querySelector('.js-secondary-column .js-ad-slot-container');
    hideableEl = document.querySelector('.top-banner-ad-container');

    if (targetEl) {
        targetEl.insertAdjacentHTML('beforebegin', iframeEmbedHtml);
        if (hideableEl) {
            hideableEl.parentNode.removeChild(hideableEl);
        }
    } else {
        console.log("Free Press: target container not found!");  
    }

} else if (isBBCPage) {
    targetEl = document.querySelector('.column--secondary');
    if (targetEl) targetEl.insertAdjacentHTML('afterbegin', iframeEmbedHtml);

} else {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.responseText === 'true') {
                document.body.insertAdjacentHTML('beforeend', 
                    '<div id="guPopup">' +
                        '<iframe id="guPopup" src="' + iframeSrc + '" style="' +
                            'border: 0;' +
                            'background: #fff;' +
                            'padding: 10px;' +
                            'box-shadow: 0px 0px 20px #999;' +
                            'z-index: 50000;' +
                            'position: absolute;' +
                            'top: 0;' +
                            'right: 0;' +
                            'height: 160px;' +
                            'overflow: hidden;' +
                        '"></iframe>' +
                        '<a onClick="el = document.querySelector(\'#guPopup\');el.parentNode.removeChild(el);" style="' +
                            'box-sizing: border-box;' +
                            'z-index: 50001;' +
                            'position: absolute;' +
                            'top: 13px;' +
                            'right: 10px;' +
                            'cursor: pointer;' +
                            'font-size: 14px;' +
                            'font-family: monospace;' +
                            'border: 1px solid #999;' +
                            'color: #999;' +
                            'padding: 4px 3px;' +
                            'width: 16px;' +
                            'height: 15px;' +
                            'line-height: 5px;' +
                            'border-radius: 10px;' +
                        '">&times;</a>' +
                    '</div>'
                );
            }
        }
    }
    xhr.open('GET', popupCheckUrl, true);
    xhr.send();
}

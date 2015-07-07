var thisUrl = window.location.href, 

    //domain = 'localhost:5000',
    domain = 'quiet-island-1381.herokuapp.com',

    isGuPage   = thisUrl.match(/theguardian\.com|localhost/),
    isBBCPage   = thisUrl.match(/bbc\.co\.uk/),
    isOtherPage = !isGuPage && !isBBCPage,

    iframeSrc  = 'http://' + domain + '/?asGuPopup=' + (isOtherPage ? '1' : '') + '&parentUrl=' + thisUrl,
    iframeEmbedHtml = '<iframe src="' + iframeSrc + '" style="border: 0; display: block; height:720px; overflow:hidden; background:#fff;"></iframe>',

    popupCheckUrl = 'http://' + domain + '/api/show-popup?parentUrl=' + thisUrl,

    targetEl,
    hideableEl;

if (isGuPage) {
    targetEl = document.querySelector('.content__secondary-column .js-mpu-ad-slot');
    hideableEl = document.querySelector('.top-banner-ad-container');
    if (hideableEl) hideableEl.parentNode.removeChild(hideableEl);
    if (targetEl) targetEl.insertAdjacentHTML('beforebegin', iframeEmbedHtml);

} else if (isBBCPage) {
    targetEl = document.querySelector('.column--secondary');
    if (targetEl) targetEl.insertAdjacentHTML('afterbegin', iframeEmbedHtml);

} else {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if (xhr.responseText === 'true') {
                document.body.insertAdjacentHTML('beforeend', 
                    '<div id="guPopup">' +
                        '<iframe id="guPopup" src="' + iframeSrc + '" style="' +
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
                        '"></iframe>' +
                        '<a onClick="el = document.querySelector(\'#guPopup\');el.parentNode.removeChild(el);" style="' +
                            'box-sizing: border-box;' +
                            'z-index: 50001;' +
                            'position: fixed;' +
                            'top: 30px;' +
                            'right: 30px;' +
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

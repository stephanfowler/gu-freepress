console.log('Free Press: running');

var thisUrl = window.location.href, 

    domain = 'https://quiet-island-1381.herokuapp.com',
    //domain = 'http://localhost:5000',
    iframeSrc  = domain + '/?parentUrl=' + thisUrl;

document.body.insertAdjacentHTML('beforeend', 
    `<div id="guPopup" style="
        position: fixed;
        top: 0;
        bottom: 0;
        right: 0;
        width: 320px;
        background-color: white;
        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.15);
        z-index: 2147483647;
        ">
        <iframe src="${iframeSrc}" style="
            border: 0;
            background: #fff;
            position: absolute;
            top: 10px;
            right: 10px;
            bottom: 10px;
            left: 10px;
            overflow: hidden;
            height: calc(100% - 10px);
        "></iframe>
        <!-- closer -->
        <a onClick="el = document.querySelector('#guPopup');el.parentNode.removeChild(el);" style="
            box-sizing: border-box;
            z-index: 50001;
            position: absolute;
            top: 13px;
            right: 10px;
            cursor: pointer;
            font-size: 14px;
            font-family: monospace;
            border: 1px solid #999;
            color: #999;
            padding: 4px 3px;
            width: 16px;
            height: 15px;
            line-height: 5px;
            border-radius: 10px;
        ">&times;</a>
    </div>`
)

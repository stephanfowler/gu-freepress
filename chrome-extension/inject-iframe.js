console.log('Free Press: running');

var thisUrl = window.location.href, 

    //domain = 'https://quiet-island-1381.herokuapp.com',
    domain = 'https://limitless-spire-48171.herokuapp.com',
    //domain = 'http://localhost:5000',

    iframeSrc  = domain + '/?parentUrl=' + thisUrl,
    hideClass = window.location.hash === "#open-bubble" ? '' : 'closed';

domain !== location.origin && document.body.insertAdjacentHTML('beforeend', 
    `<style>
        #bubbleSideBar {
            position: fixed;
            top: 0;
            height: 100%;
            right: 0;
            width: 320px;
            background-color: white;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.15);
            z-index: 2147483647;
            overflow: hidden;
            border-bottom-left-radius: 0;
            border-top-left-radius: 0;
            border-bottom-right-radius: 0;
            transition: all 150ms;
        }
        #bubbleSideBar.closed {
            height: 35px;
            width: 37px;
            border-bottom-left-radius: 15px;
            border-top-left-radius: 15px;
            border-bottom-right-radius: 15px;
        }
        #bubbleToggle {
            height: 32px;
            width: 32px;
            display: block;
            position: absolute;
            right: 10px;
            top: 0px;
            background-color: transparent;
            border: none;
            cursor: pointer;
        }
    </style>
    <div id="bubbleSideBar" class="${hideClass}">
        <iframe src="${iframeSrc}" style="
            border: 0;
            background: #fff;
            position: absolute;
            top: 0px;
            right: 0px;
            bottom: 0px;
            left: 0px;
            overflow: hidden;
            height: 100%;
            width: 100%;
        "></iframe>
        <!-- closer -->
        <div id="bubbleToggle"
            onClick="document.querySelector('#bubbleSideBar').classList.toggle('closed')"></div>
    </div>`
)

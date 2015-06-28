console.log('Loading Free Press');

var domain = 'quiet-island-1381.herokuapp.com',
    url = '//' + domain + '/?parentUrl=' + window.location.href,
    articleEl = document.querySelector('.content__secondary-column .js-mpu-ad-slot');

console.log('URl: ' + url);

if (articleEl) {
    console.log('Inserting...');
    articleEl.insertAdjacentHTML('beforebegin', '<iframe src="' + url + '" style="border: 0; float:  left; clear: left; width: 100%; height: 600px; margin: 0 0 72px 0;"></iframe>')
}

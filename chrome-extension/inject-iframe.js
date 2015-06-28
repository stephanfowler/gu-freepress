var 
    domain = 'localhost:5000',
    //domain = 'quiet-island-1381.herokuapp.com',
    url = '//' + domain + '/?parentUrl=' + window.location.href,
    articleEl = document.querySelector('.content__secondary-column .js-mpu-ad-slot'),
    bannerAdEl = document.querySelector('.top-banner-ad-container');

console.log('URl: ' + url);

if (bannerAdEl) {
    console.log('Deleting ad...');
    bannerAdEl.parentNode.removeChild(bannerAdEl);
}

if (articleEl) {
    console.log('Inserting Free Press: ' + url);
    articleEl.insertAdjacentHTML('beforebegin', '<iframe src="' + url + '" style="border: 0; float:  left; clear: left; width: 100%; height: 600px; margin: 0 0 72px 0;"></iframe>')
}


const pp = require('puppeteer-core');
const url = require('url');
const path = require('path')
const fs = require('fs');

const startUrl = "";


// 递归创建目录 同步方法
function mkdirsSync(dirname) {
  if (fs.existsSync(dirname)) {
    return true;
  } 
  else {
    if (mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname);
      return true;
    }
  }
}

if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (prefix){
    return this.slice(0, prefix.length) === prefix;
  };
}


(async() => {
    const browser = await pp.launch({
        headless: false,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        ignoreHTTPSErrors: true,
        defaultViewport: {
            width: 1376,
            height: 800
        },
    });

    //page.setViewport({
        //width: 1376,
        //height: 768
    //});
    
    //await page.setRequestInterception(true);
    //await page.on('request', request => {
        //console.log('=> req: ' + request.resourceType()  + ' '  + request.url());

        //request.continue();
    //});

    browser.on('targetcreated', async target => {
        console.log("target created:  " +  target + ' ' + target.type());
        if(target.type() == 'page') {
            var q = await target.page();
            console.log('page: ' + q);

            q.on('response', async response => {
                var t = response.request().resourceType();
                console.log('<= resp: ' + t + ' ' + response.url() );
                buffer = await response.buffer();

                uri = url.parse(response.url())

                pathname = uri.pathname;
                if(pathname.endsWith("/")) {
                    pathname = pathname + 'index.html';
                }

                fname = path.basename(pathname)
                if(fname == '') {
                    fname = 'index.html'
                }
                
                fpath = path.dirname(pathname)

                fpath = path.join(uri.host, fpath)

                console.log("fpath: " + fpath + " fname: " + fname);

                mkdirsSync(fpath);
                fs.writeFile(path.join(fpath, fname), buffer, { 'flag': 'w' }, function(err) {
                    if(err) {
                        console.log('------------------------------------')
                        console.log('------------------------------------')
                        console.log('------------------------------------')
                        console.log("writeFile err: " + err);
                        console.log('------------------------------------')
                        console.log('------------------------------------')
                        console.log('------------------------------------')
                        console.log('------------------------------------')
                        console.log('------------------------------------')
                    }
                });
            });
        }
    });

    const page = await browser.newPage();
    await page.goto(startUrl);
    // await browser.close();
})();


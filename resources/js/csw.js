if(V === undefined)
{
    const V='1.0.0.2';
}
main();
function main()
{
    try
    {
        initSW();
    }
    catch(e)
    {
        console.error("Caught Error (CSW.JS - main) : ", e);
    }
}
function initSW()
{
    try
    {
        const allowPWA = (location.protocol === 'https:' || location.hostname === 'localhost');
          // add manifest only when allowed
        if (allowPWA) {
            const head = document.head;
            makeElem('link', head, attributes = {rel : 'manifest', href : 'manifest.webmanifest?v='+V}); // Manifest
            makeElem('meta', head, attributes = {name : 'theme-color', content : '#0F172A'}); // Theme color
            makeElem('link', head, attributes = {rel : 'icon', href : 'assets/icons/icon-192.png?v='+V, sizes : '32x32'}); // Favicon
            makeElem('link', head, attributes = {rel : 'apple-touch-icon', href : 'assets/icons/icon-192.png?v='+V}); // Apple touch icon

            // register SW
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.register('sw.js?v='+V, { scope: './' })
                .then(() => {console.log('SW registered'); installPWA();})
                .catch(err => console.warn('SW registration failed:', err));
            }
        } else {
            console.info('PWA disabled on file:// preview');
            installBtnShowHide(false);
        }
    }
    catch(e)
    {
        console.error("Caught Error (CSW.JS - initSW): ", e);
    }
}

function installPWA()
{
    try
    {
        const installBtn = document.getElementById('btn-install');
        let deferredPrompt = null;
      
        // Only show the button when the site is installable
        window.addEventListener('beforeinstallprompt', (e) => {
          e.preventDefault();              // stop the browser’s automatic mini-infobar
          deferredPrompt = e;
          installBtnShowHide(true);
        });

        if(installBtn !== undefined && installBtn !== null)
        {
            installBtn.addEventListener('click', async () => {
              installBtnShowHide(false);
              if (!deferredPrompt) return;
              deferredPrompt.prompt();         // show the browser install prompt
              const { outcome } = await deferredPrompt.userChoice;
              console.log('User choice:', outcome);
              deferredPrompt = null;
              installBtnShowHide(false);
            });
        }
      
        // Hide button if already installed
        window.addEventListener('appinstalled', () => {
          console.log('App installed');
          installBtnShowHide('installed');
        });
      
        // Also hide if running as an installed app
        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
          installBtnShowHide('installing');
        }
    }
    catch(e)
    {
        console.error("Caught Error (CSW.JS - InstallPWA) : ", e);
    }
}

function installClicked()
{
    const installBtn = document.getElementById('btn-install');
    installBtn.click();
}

function installBtnShowHide(isShow)
{
    const installBtn = document.getElementById('btn-install');
    if(isShow === true)
    {
        installBtn.hidden = false;
        installBtn.style.cursor='pointer';
        installBtn.removeAttribute("disabled");
    }
    else
    {
        const lblbtn = document.getElementById('lbl-btn-install');
        installBtn.hidden = true;
        installBtn.setAttribute("disabled","disabled");
        if(isShow === 'installed')
        {
            installBtn.style.cursor='not-allowed';
            lblbtn.style.cursor='not-allowed';
            installBtn.style.display='none';
        }
        else if(isShow === 'installing')
        {
            installBtn.style.cursor='wait';
            lblbtn.style.cursor='wait';
        }
    }
}
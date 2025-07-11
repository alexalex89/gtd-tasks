// PWA Service Worker Registration and Install Prompt

let deferredPrompt;

let registration;

export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          registration = reg;
          console.log('SW registered: ', reg);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
};

export const setupInstallPrompt = () => {
  // Listen for the beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('beforeinstallprompt Event fired');
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Show install button or notification
    showInstallPromotion();
  });

  // Listen for the app being installed
  window.addEventListener('appinstalled', (evt) => {
    console.log('App was installed');
    hideInstallPromotion();
  });
};

const showInstallPromotion = () => {
  // Create install banner
  const installBanner = document.createElement('div');
  installBanner.id = 'install-banner';
  installBanner.className = 'fixed top-0 left-0 right-0 z-50 bg-indigo-600 text-white p-3 text-center';
  installBanner.innerHTML = `
    <div class="flex items-center justify-between max-w-md mx-auto">
      <span class="text-sm">📱 Install GTD Tasks app for better experience</span>
      <div class="flex gap-2">
        <button id="install-button" class="bg-white text-indigo-600 px-3 py-1 rounded text-sm font-medium">
          Install
        </button>
        <button id="dismiss-install" class="text-white/80 hover:text-white px-2">
          ✕
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(installBanner);
  
  // Handle install button click
  document.getElementById('install-button').addEventListener('click', () => {
    installApp();
  });
  
  // Handle dismiss button click
  document.getElementById('dismiss-install').addEventListener('click', () => {
    hideInstallPromotion();
  });
};

const hideInstallPromotion = () => {
  const banner = document.getElementById('install-banner');
  if (banner) {
    banner.remove();
  }
};

export const installApp = async () => {
  if (deferredPrompt) {
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // Clear the deferred prompt
    deferredPrompt = null;
    hideInstallPromotion();
  }
};

// Check if app is already installed
export const isAppInstalled = () => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true;
};

// Manual refresh function for PWA updates
export const refreshApp = () => {
  if ('serviceWorker' in navigator && registration) {
    registration.update().then(() => {
      console.log('Checking for updates...');
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      // Force reload
      window.location.reload();
    });
  } else {
    // Fallback for non-PWA
    window.location.reload();
  }
};

// Initialize PWA features
export const initPWA = () => {
  registerServiceWorker();
  
  // Only show install prompt if not already installed
  if (!isAppInstalled()) {
    setupInstallPrompt();
  }
};
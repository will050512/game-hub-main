import {registerRoute as workbox_routing_registerRoute} from 'C:/Users/s1568/Desktop/專題/game-hub/node_modules/workbox-routing/registerRoute.mjs';
import {StaleWhileRevalidate as workbox_strategies_StaleWhileRevalidate} from 'C:/Users/s1568/Desktop/專題/game-hub/node_modules/workbox-strategies/StaleWhileRevalidate.mjs';
import {ExpirationPlugin as workbox_expiration_ExpirationPlugin} from 'C:/Users/s1568/Desktop/專題/game-hub/node_modules/workbox-expiration/ExpirationPlugin.mjs';
import {CacheFirst as workbox_strategies_CacheFirst} from 'C:/Users/s1568/Desktop/專題/game-hub/node_modules/workbox-strategies/CacheFirst.mjs';
import {clientsClaim as workbox_core_clientsClaim} from 'C:/Users/s1568/Desktop/專題/game-hub/node_modules/workbox-core/clientsClaim.mjs';
import {precacheAndRoute as workbox_precaching_precacheAndRoute} from 'C:/Users/s1568/Desktop/專題/game-hub/node_modules/workbox-precaching/precacheAndRoute.mjs';
import {cleanupOutdatedCaches as workbox_precaching_cleanupOutdatedCaches} from 'C:/Users/s1568/Desktop/專題/game-hub/node_modules/workbox-precaching/cleanupOutdatedCaches.mjs';
import {NavigationRoute as workbox_routing_NavigationRoute} from 'C:/Users/s1568/Desktop/專題/game-hub/node_modules/workbox-routing/NavigationRoute.mjs';
import {createHandlerBoundToURL as workbox_precaching_createHandlerBoundToURL} from 'C:/Users/s1568/Desktop/專題/game-hub/node_modules/workbox-precaching/createHandlerBoundToURL.mjs';/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */








self.skipWaiting();

workbox_core_clientsClaim();


/**
 * The precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
workbox_precaching_precacheAndRoute([
  {
    "url": "registerSW.js",
    "revision": "1872c500de691dce40960bb85481de07"
  },
  {
    "url": "index.html",
    "revision": "65cdf66000c328f11e7c613a691bf379"
  },
  {
    "url": "assets/web-BnSh2DiA.js",
    "revision": null
  },
  {
    "url": "assets/spriteLoader-CICAPQzq.js",
    "revision": null
  },
  {
    "url": "assets/ShopView-Dix8vAXf.css",
    "revision": null
  },
  {
    "url": "assets/ShopView-BGfh1fPN.js",
    "revision": null
  },
  {
    "url": "assets/settingsStore-DVh7jLv6.js",
    "revision": null
  },
  {
    "url": "assets/rewardContract-D8dTh0cz.js",
    "revision": null
  },
  {
    "url": "assets/LobbyView-pO7uaDcJ.js",
    "revision": null
  },
  {
    "url": "assets/LobbyView-fbpqGZAZ.css",
    "revision": null
  },
  {
    "url": "assets/KawaiiIcon-PztpX3JR.js",
    "revision": null
  },
  {
    "url": "assets/KawaiiIcon-BAihpqoy.css",
    "revision": null
  },
  {
    "url": "assets/KawaiiDecorLayer-CLsyRIF5.js",
    "revision": null
  },
  {
    "url": "assets/KawaiiDecorLayer-CcoNZzgY.css",
    "revision": null
  },
  {
    "url": "assets/jeep-sqlite.entry-DUphqLu2.js",
    "revision": null
  },
  {
    "url": "assets/index-Iv7zONjE.js",
    "revision": null
  },
  {
    "url": "assets/index-DzH0u-JX.js",
    "revision": null
  },
  {
    "url": "assets/index-DSLeQfsA.js",
    "revision": null
  },
  {
    "url": "assets/index-DQJJef8r.js",
    "revision": null
  },
  {
    "url": "assets/index-DM4YephH.js",
    "revision": null
  },
  {
    "url": "assets/index-CWyUVdt0.js",
    "revision": null
  },
  {
    "url": "assets/index-CtN6kwSF.js",
    "revision": null
  },
  {
    "url": "assets/index-Cr1SxPNZ.js",
    "revision": null
  },
  {
    "url": "assets/index-CGKcK5g5.js",
    "revision": null
  },
  {
    "url": "assets/index-CeFf3zq8.js",
    "revision": null
  },
  {
    "url": "assets/index-CDYT-YTc.js",
    "revision": null
  },
  {
    "url": "assets/index-BZWa2Zq-.css",
    "revision": null
  },
  {
    "url": "assets/index-BsWjpcWp.js",
    "revision": null
  },
  {
    "url": "assets/index-BiZ6b2Ur.js",
    "revision": null
  },
  {
    "url": "assets/index-BeblJIrH.js",
    "revision": null
  },
  {
    "url": "assets/index-B3y6DMjW.js",
    "revision": null
  },
  {
    "url": "assets/index-0hIofQTn.js",
    "revision": null
  },
  {
    "url": "assets/iconManifest-B555aK3j.js",
    "revision": null
  },
  {
    "url": "assets/GameResultView-BLWaUs9p.js",
    "revision": null
  },
  {
    "url": "assets/GameResultView-BjHP1AHL.css",
    "revision": null
  },
  {
    "url": "assets/GamePlayView-pn7ooUXJ.js",
    "revision": null
  },
  {
    "url": "assets/GamePlayView-CgCxVM_q.css",
    "revision": null
  },
  {
    "url": "assets/GameInfoView-Z2ucj0AI.js",
    "revision": null
  },
  {
    "url": "assets/GameInfoView-BbnN_Idu.css",
    "revision": null
  },
  {
    "url": "assets/currencyStore-IhlSrCaM.js",
    "revision": null
  },
  {
    "url": "assets/CanvasEffectsManager-kmUPxDjJ.js",
    "revision": null
  },
  {
    "url": "assets/BaseCard-DlQpZLSH.css",
    "revision": null
  },
  {
    "url": "assets/BaseCard-CZAi6iX3.js",
    "revision": null
  },
  {
    "url": "assets/AudioMixerPanel-D1OBsD3z.js",
    "revision": null
  },
  {
    "url": "assets/AudioMixerPanel-9WudXtYQ.css",
    "revision": null
  },
  {
    "url": "assets/audio-C-3PLe4i.js",
    "revision": null
  },
  {
    "url": "assets/ArtXpGem-C6PVytFl.js",
    "revision": null
  },
  {
    "url": "assets/ArtTttX-Dd567xDS.js",
    "revision": null
  },
  {
    "url": "assets/ArtTttO-CPSXIfgd.js",
    "revision": null
  },
  {
    "url": "assets/ArtTttCell-BOZlX7bg.js",
    "revision": null
  },
  {
    "url": "assets/ArtTowerBase-Cj4RNK7f.js",
    "revision": null
  },
  {
    "url": "assets/ArtTowerBarrel-BuD-MXdN.js",
    "revision": null
  },
  {
    "url": "assets/ArtTetrisBlock-BIk26uKF.js",
    "revision": null
  },
  {
    "url": "assets/ArtTdProjectile-OM1gwgAN.js",
    "revision": null
  },
  {
    "url": "assets/ArtTdEnemy-Bx6Xebrf.js",
    "revision": null
  },
  {
    "url": "assets/ArtSurvivorPlayer-PO4HEHiJ.js",
    "revision": null
  },
  {
    "url": "assets/ArtSudokuCell-DeN3V0yP.js",
    "revision": null
  },
  {
    "url": "assets/ArtSpecialFood-M-cB0lVx.js",
    "revision": null
  },
  {
    "url": "assets/ArtSnakeHead-CGp67uuH.js",
    "revision": null
  },
  {
    "url": "assets/ArtSnakeBody-DzVovobM.js",
    "revision": null
  },
  {
    "url": "assets/ArtShieldBlock-CkCp_8Ne.js",
    "revision": null
  },
  {
    "url": "assets/ArtRing-3kXOK7tm.js",
    "revision": null
  },
  {
    "url": "assets/ArtProjectile-Bxkg2Nla.js",
    "revision": null
  },
  {
    "url": "assets/ArtPowerup-CxwQH8vu.js",
    "revision": null
  },
  {
    "url": "assets/ArtPortal-DIHA38T9.js",
    "revision": null
  },
  {
    "url": "assets/ArtPipeCap-CmvAZlVT.js",
    "revision": null
  },
  {
    "url": "assets/ArtPipeBody-mgA5xoLj.js",
    "revision": null
  },
  {
    "url": "assets/ArtPaddle-_M1xlUHM.js",
    "revision": null
  },
  {
    "url": "assets/ArtMultiply-BgUSbyxc.js",
    "revision": null
  },
  {
    "url": "assets/ArtMissile-GJ0iA4R7.js",
    "revision": null
  },
  {
    "url": "assets/ArtLaser-ChkgfRKU.js",
    "revision": null
  },
  {
    "url": "assets/ArtInvaderShip-YYiURt-X.js",
    "revision": null
  },
  {
    "url": "assets/ArtGround-CVZoZhaE.js",
    "revision": null
  },
  {
    "url": "assets/ArtGoldenItem-BkXqWHXo.js",
    "revision": null
  },
  {
    "url": "assets/ArtGoldenApple-DfUg2dMZ.js",
    "revision": null
  },
  {
    "url": "assets/ArtFruitWatermelon-XbU3H6Wi.js",
    "revision": null
  },
  {
    "url": "assets/ArtFruitStar-6B5uDUad.js",
    "revision": null
  },
  {
    "url": "assets/ArtFruitOrange-D4vhnMAj.js",
    "revision": null
  },
  {
    "url": "assets/ArtFruitGrape-DSkqRDRn.js",
    "revision": null
  },
  {
    "url": "assets/ArtFruitApple-CwqUdtsX.js",
    "revision": null
  },
  {
    "url": "assets/ArtEnemySlime-oe9nlnVe.js",
    "revision": null
  },
  {
    "url": "assets/ArtEnemySkeleton-DDdDAQAs.js",
    "revision": null
  },
  {
    "url": "assets/ArtEnemyNormal-NXHTJ6_8.js",
    "revision": null
  },
  {
    "url": "assets/ArtEnemyBoss-Cg11qBob.js",
    "revision": null
  },
  {
    "url": "assets/ArtEnemyBat-BKLSBlO2.js",
    "revision": null
  },
  {
    "url": "assets/ArtCloud-DA7EKB2X.js",
    "revision": null
  },
  {
    "url": "assets/ArtClose-0BMY-Wis.js",
    "revision": null
  },
  {
    "url": "assets/ArtCheck-xSu-u_ZG.js",
    "revision": null
  },
  {
    "url": "assets/ArtCardFace-43-CasSX.js",
    "revision": null
  },
  {
    "url": "assets/ArtCardBack-Bua2qbeV.js",
    "revision": null
  },
  {
    "url": "assets/ArtBulletPlayer-CIIvno6v.js",
    "revision": null
  },
  {
    "url": "assets/ArtBulletAlien-DjxnBhFi.js",
    "revision": null
  },
  {
    "url": "assets/ArtBrickBoss-MM4vhwlh.js",
    "revision": null
  },
  {
    "url": "assets/ArtBrick-Bk0pmIWv.js",
    "revision": null
  },
  {
    "url": "assets/ArtBomb-5WPdZ6SD.js",
    "revision": null
  },
  {
    "url": "assets/ArtBird-CPZKaVLN.js",
    "revision": null
  },
  {
    "url": "assets/ArtBasket-BrEo4n2x.js",
    "revision": null
  },
  {
    "url": "assets/ArtBall-Chz7yRkx.js",
    "revision": null
  },
  {
    "url": "assets/ArtApple-CSrBnIlC.js",
    "revision": null
  },
  {
    "url": "assets/ArtAlienSquid-B7tkhRWj.js",
    "revision": null
  },
  {
    "url": "assets/ArtAlienOctopus-BAO-uqUo.js",
    "revision": null
  },
  {
    "url": "assets/ArtAlienCrab-vyuqZo4u.js",
    "revision": null
  },
  {
    "url": "assets/Art2048Tile-DZKuObwd.js",
    "revision": null
  },
  {
    "url": "assets/achievements-BLbmGv-o.js",
    "revision": null
  },
  {
    "url": "icons/icon-192.svg",
    "revision": "3a517b9e188e2fbcf3cc16edc056bd3a"
  },
  {
    "url": "icons/icon-512.svg",
    "revision": "d34a0dbcc0d798895b55b08704411272"
  },
  {
    "url": "manifest.webmanifest",
    "revision": "92a25cff57b2c04c26f6f6da48337efa"
  }
], {});
workbox_precaching_cleanupOutdatedCaches();
workbox_routing_registerRoute(new workbox_routing_NavigationRoute(workbox_precaching_createHandlerBoundToURL("index.html")));


workbox_routing_registerRoute(/\.(?:js|css)$/, new workbox_strategies_StaleWhileRevalidate({ "cacheName":"static-resources", plugins: [] }), 'GET');
workbox_routing_registerRoute(/\.(?:png|jpg|jpeg|svg|gif|webp)$/, new workbox_strategies_CacheFirst({ "cacheName":"images", plugins: [new workbox_expiration_ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 2592000 })] }), 'GET');
workbox_routing_registerRoute(/\.(?:woff|woff2|ttf|eot)$/, new workbox_strategies_CacheFirst({ "cacheName":"fonts", plugins: [new workbox_expiration_ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 31536000 })] }), 'GET');





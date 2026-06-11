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
    "revision": "854450b3395820f70a4073a918f0fa19"
  },
  {
    "url": "assets/web-BnSh2DiA.js",
    "revision": null
  },
  {
    "url": "assets/spriteLoader-DhdCekwO.js",
    "revision": null
  },
  {
    "url": "assets/ShopView-Dix8vAXf.css",
    "revision": null
  },
  {
    "url": "assets/ShopView-DITe919t.js",
    "revision": null
  },
  {
    "url": "assets/settingsStore-Csv1J9rE.js",
    "revision": null
  },
  {
    "url": "assets/rewardContract-D8dTh0cz.js",
    "revision": null
  },
  {
    "url": "assets/LobbyView-BxZVir5H.js",
    "revision": null
  },
  {
    "url": "assets/LobbyView-BlY63med.css",
    "revision": null
  },
  {
    "url": "assets/KawaiiIcon-DTioqspG.js",
    "revision": null
  },
  {
    "url": "assets/KawaiiIcon-BAihpqoy.css",
    "revision": null
  },
  {
    "url": "assets/KawaiiDecorLayer-DIoa3QGV.js",
    "revision": null
  },
  {
    "url": "assets/KawaiiDecorLayer-CcoNZzgY.css",
    "revision": null
  },
  {
    "url": "assets/jeep-sqlite.entry-DhZWvspF.js",
    "revision": null
  },
  {
    "url": "assets/index-WxyLAUHE.js",
    "revision": null
  },
  {
    "url": "assets/index-HqQ1OqKT.js",
    "revision": null
  },
  {
    "url": "assets/index-DZXW9BeC.js",
    "revision": null
  },
  {
    "url": "assets/index-DoAqoq3c.js",
    "revision": null
  },
  {
    "url": "assets/index-DM4YephH.js",
    "revision": null
  },
  {
    "url": "assets/index-D97TJVsa.js",
    "revision": null
  },
  {
    "url": "assets/index-CNgTNcvw.js",
    "revision": null
  },
  {
    "url": "assets/index-CMHUbiGg.js",
    "revision": null
  },
  {
    "url": "assets/index-CmFfI_Hc.js",
    "revision": null
  },
  {
    "url": "assets/index-CmaEmyq3.js",
    "revision": null
  },
  {
    "url": "assets/index-CBWxweRj.js",
    "revision": null
  },
  {
    "url": "assets/index-B_DXWz5f.js",
    "revision": null
  },
  {
    "url": "assets/index-BZWa2Zq-.css",
    "revision": null
  },
  {
    "url": "assets/index-BN6kjme6.js",
    "revision": null
  },
  {
    "url": "assets/index-BGpjDfLT.js",
    "revision": null
  },
  {
    "url": "assets/index-BfHtBKxL.js",
    "revision": null
  },
  {
    "url": "assets/index-B837LSNn.js",
    "revision": null
  },
  {
    "url": "assets/iconManifest-B555aK3j.js",
    "revision": null
  },
  {
    "url": "assets/GameResultView-CkfeknWK.js",
    "revision": null
  },
  {
    "url": "assets/GameResultView-BjHP1AHL.css",
    "revision": null
  },
  {
    "url": "assets/GamePlayView-CgkBLMDt.js",
    "revision": null
  },
  {
    "url": "assets/GamePlayView-BZxDSNjT.css",
    "revision": null
  },
  {
    "url": "assets/gameOptimizationProfiles-BBf8MQxO.js",
    "revision": null
  },
  {
    "url": "assets/GameInfoView-CIzEQQdN.css",
    "revision": null
  },
  {
    "url": "assets/GameInfoView-3nyaFcd3.js",
    "revision": null
  },
  {
    "url": "assets/currencyStore-xsawvnIe.js",
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
    "url": "assets/BaseCard-B-sL0AjV.js",
    "revision": null
  },
  {
    "url": "assets/AudioMixerPanel-9WudXtYQ.css",
    "revision": null
  },
  {
    "url": "assets/AudioMixerPanel-5miAnX3l.js",
    "revision": null
  },
  {
    "url": "assets/audio-B4Yw3QaF.js",
    "revision": null
  },
  {
    "url": "assets/ArtXpGem-h6F019qd.js",
    "revision": null
  },
  {
    "url": "assets/ArtTttX-Igc2c_9j.js",
    "revision": null
  },
  {
    "url": "assets/ArtTttO-BK0jEnZ_.js",
    "revision": null
  },
  {
    "url": "assets/ArtTttCell-D0zrt6DF.js",
    "revision": null
  },
  {
    "url": "assets/ArtTowerBase-Cd1xwigw.js",
    "revision": null
  },
  {
    "url": "assets/ArtTowerBarrel-BCaF5gC9.js",
    "revision": null
  },
  {
    "url": "assets/ArtTetrisBlock-ZhBZ4hQW.js",
    "revision": null
  },
  {
    "url": "assets/ArtTdProjectile-Bkxo7S59.js",
    "revision": null
  },
  {
    "url": "assets/ArtTdEnemy-Bhmb7hUY.js",
    "revision": null
  },
  {
    "url": "assets/ArtSurvivorPlayer-DrgwIyBM.js",
    "revision": null
  },
  {
    "url": "assets/ArtSudokuCell-XGrqDwmF.js",
    "revision": null
  },
  {
    "url": "assets/ArtSpecialFood-LRowWLSe.js",
    "revision": null
  },
  {
    "url": "assets/ArtSnakeHead-DMVISNJw.js",
    "revision": null
  },
  {
    "url": "assets/ArtSnakeBody-P4iDPV6c.js",
    "revision": null
  },
  {
    "url": "assets/ArtShieldBlock-D1eVmJ9R.js",
    "revision": null
  },
  {
    "url": "assets/ArtRing-DgQGTk1E.js",
    "revision": null
  },
  {
    "url": "assets/ArtProjectile-CHVvRxWy.js",
    "revision": null
  },
  {
    "url": "assets/ArtPowerup-DXQbQtR4.js",
    "revision": null
  },
  {
    "url": "assets/ArtPortal-Dw3hXONS.js",
    "revision": null
  },
  {
    "url": "assets/ArtPipeCap-MbWtFESZ.js",
    "revision": null
  },
  {
    "url": "assets/ArtPipeBody-CgS5H0d8.js",
    "revision": null
  },
  {
    "url": "assets/ArtPaddle-BBxIOh4C.js",
    "revision": null
  },
  {
    "url": "assets/ArtMultiply-BKI2rqf_.js",
    "revision": null
  },
  {
    "url": "assets/ArtMissile-CFu10e4k.js",
    "revision": null
  },
  {
    "url": "assets/ArtLaser-r7J3dRNX.js",
    "revision": null
  },
  {
    "url": "assets/ArtInvaderShip-BmfEi-Bf.js",
    "revision": null
  },
  {
    "url": "assets/ArtGround-0TZNCA9C.js",
    "revision": null
  },
  {
    "url": "assets/ArtGoldenItem-4tckg0dH.js",
    "revision": null
  },
  {
    "url": "assets/ArtGoldenApple-C55Tgu-B.js",
    "revision": null
  },
  {
    "url": "assets/ArtFruitWatermelon-y1MzvKFL.js",
    "revision": null
  },
  {
    "url": "assets/ArtFruitStar-pxjy5Y2o.js",
    "revision": null
  },
  {
    "url": "assets/ArtFruitOrange-D0z36KSz.js",
    "revision": null
  },
  {
    "url": "assets/ArtFruitGrape-DbxeWBVs.js",
    "revision": null
  },
  {
    "url": "assets/ArtFruitApple-RWQqOjsi.js",
    "revision": null
  },
  {
    "url": "assets/ArtEnemySlime-D3IGxtEh.js",
    "revision": null
  },
  {
    "url": "assets/ArtEnemySkeleton-CXpwvW9X.js",
    "revision": null
  },
  {
    "url": "assets/ArtEnemyNormal-ySErc-U8.js",
    "revision": null
  },
  {
    "url": "assets/ArtEnemyBoss-Bi2BnOZC.js",
    "revision": null
  },
  {
    "url": "assets/ArtEnemyBat-DcoOoaB0.js",
    "revision": null
  },
  {
    "url": "assets/ArtCloud-D7lvpOgc.js",
    "revision": null
  },
  {
    "url": "assets/ArtClose-CUofey87.js",
    "revision": null
  },
  {
    "url": "assets/ArtCheck-Bv71T40y.js",
    "revision": null
  },
  {
    "url": "assets/ArtCardFace-D_CiPboU.js",
    "revision": null
  },
  {
    "url": "assets/ArtCardBack-BNrlSlei.js",
    "revision": null
  },
  {
    "url": "assets/ArtBulletPlayer-CRCSqgjB.js",
    "revision": null
  },
  {
    "url": "assets/ArtBulletAlien-Oz5Xb1bO.js",
    "revision": null
  },
  {
    "url": "assets/ArtBrickBoss-BryPnRyu.js",
    "revision": null
  },
  {
    "url": "assets/ArtBrick-BKyPR57y.js",
    "revision": null
  },
  {
    "url": "assets/ArtBomb-B8DcCxiD.js",
    "revision": null
  },
  {
    "url": "assets/ArtBird-Do0-NwTL.js",
    "revision": null
  },
  {
    "url": "assets/ArtBasket-CgeQviEu.js",
    "revision": null
  },
  {
    "url": "assets/ArtBall-DDcGPNRC.js",
    "revision": null
  },
  {
    "url": "assets/ArtApple-orKhzKPX.js",
    "revision": null
  },
  {
    "url": "assets/ArtAlienSquid-CzbZ_YBt.js",
    "revision": null
  },
  {
    "url": "assets/ArtAlienOctopus-Dc-A1lre.js",
    "revision": null
  },
  {
    "url": "assets/ArtAlienCrab-BI7QYWfM.js",
    "revision": null
  },
  {
    "url": "assets/Art2048Tile-BKQ3n2AD.js",
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





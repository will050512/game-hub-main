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
    "revision": "1c633fc7713492774885a877f808b4ed"
  },
  {
    "url": "assets/web-BnSh2DiA.js",
    "revision": null
  },
  {
    "url": "assets/spriteLoader-C1xKnSCG.js",
    "revision": null
  },
  {
    "url": "assets/ShopView-jfNMY72k.css",
    "revision": null
  },
  {
    "url": "assets/ShopView-B5vC36i9.js",
    "revision": null
  },
  {
    "url": "assets/settingsStore-lR-4XimH.js",
    "revision": null
  },
  {
    "url": "assets/rewardContract-D8dTh0cz.js",
    "revision": null
  },
  {
    "url": "assets/responsiveGridLayout-DPFUYiXy.js",
    "revision": null
  },
  {
    "url": "assets/LobbyView-Wl5lzcod.css",
    "revision": null
  },
  {
    "url": "assets/LobbyView-0lnXb0MR.js",
    "revision": null
  },
  {
    "url": "assets/KawaiiIcon-CmHePkPj.js",
    "revision": null
  },
  {
    "url": "assets/KawaiiIcon-BAihpqoy.css",
    "revision": null
  },
  {
    "url": "assets/KawaiiDecorLayer-DCjPUev4.js",
    "revision": null
  },
  {
    "url": "assets/KawaiiDecorLayer-CcoNZzgY.css",
    "revision": null
  },
  {
    "url": "assets/jeep-sqlite.entry-wbYbyCpY.js",
    "revision": null
  },
  {
    "url": "assets/index-n88h16m3.js",
    "revision": null
  },
  {
    "url": "assets/index-F5mKYdap.js",
    "revision": null
  },
  {
    "url": "assets/index-DZ7MavUJ.js",
    "revision": null
  },
  {
    "url": "assets/index-DS-YhvpA.js",
    "revision": null
  },
  {
    "url": "assets/index-DM4YephH.js",
    "revision": null
  },
  {
    "url": "assets/index-DciX0XEJ.js",
    "revision": null
  },
  {
    "url": "assets/index-CR02fs5b.js",
    "revision": null
  },
  {
    "url": "assets/index-BZWa2Zq-.css",
    "revision": null
  },
  {
    "url": "assets/index-BxHdnfRu.js",
    "revision": null
  },
  {
    "url": "assets/index-BwSGmJoC.js",
    "revision": null
  },
  {
    "url": "assets/index-BmWv0MUo.js",
    "revision": null
  },
  {
    "url": "assets/index-BmrYPfYw.js",
    "revision": null
  },
  {
    "url": "assets/index-BKY4WmHl.js",
    "revision": null
  },
  {
    "url": "assets/index-BJxwMe4Y.js",
    "revision": null
  },
  {
    "url": "assets/index-B60c26rW.js",
    "revision": null
  },
  {
    "url": "assets/index-7je2bVhi.js",
    "revision": null
  },
  {
    "url": "assets/index-4nLqXqbq.js",
    "revision": null
  },
  {
    "url": "assets/iconManifest-B555aK3j.js",
    "revision": null
  },
  {
    "url": "assets/GameResultView-DrGaZrII.css",
    "revision": null
  },
  {
    "url": "assets/GameResultView-C2pORXLh.js",
    "revision": null
  },
  {
    "url": "assets/GamePlayView-CAtW4ZPE.js",
    "revision": null
  },
  {
    "url": "assets/GamePlayView-BO4TGqFp.css",
    "revision": null
  },
  {
    "url": "assets/gameOptimizationProfiles-BBf8MQxO.js",
    "revision": null
  },
  {
    "url": "assets/GameInfoView-CTUCpgiq.js",
    "revision": null
  },
  {
    "url": "assets/GameInfoView-CIzEQQdN.css",
    "revision": null
  },
  {
    "url": "assets/currencyStore--rlbpuls.js",
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
    "url": "assets/BaseCard-DkGX6-Tj.js",
    "revision": null
  },
  {
    "url": "assets/AudioMixerPanel-DjnFQ1Yo.js",
    "revision": null
  },
  {
    "url": "assets/AudioMixerPanel-9WudXtYQ.css",
    "revision": null
  },
  {
    "url": "assets/audio-CYyMBTLk.js",
    "revision": null
  },
  {
    "url": "assets/ArtXpGem-CcThhAvS.js",
    "revision": null
  },
  {
    "url": "assets/ArtTttX-C3G0plJW.js",
    "revision": null
  },
  {
    "url": "assets/ArtTttO-CbkmJ1RS.js",
    "revision": null
  },
  {
    "url": "assets/ArtTttCell-BbCUpWIn.js",
    "revision": null
  },
  {
    "url": "assets/ArtTowerBase-BQw84koG.js",
    "revision": null
  },
  {
    "url": "assets/ArtTowerBarrel-BwDGKJki.js",
    "revision": null
  },
  {
    "url": "assets/ArtTetrisBlock-BZ9GyOTe.js",
    "revision": null
  },
  {
    "url": "assets/ArtTdProjectile-CTafJC3M.js",
    "revision": null
  },
  {
    "url": "assets/ArtTdEnemy-BEoJsYby.js",
    "revision": null
  },
  {
    "url": "assets/ArtSurvivorPlayer-BIVSYIZM.js",
    "revision": null
  },
  {
    "url": "assets/ArtSudokuCell-CcoP4b_o.js",
    "revision": null
  },
  {
    "url": "assets/ArtSpecialFood-qCgC2Zjg.js",
    "revision": null
  },
  {
    "url": "assets/ArtSnakeHead-DQJgll2A.js",
    "revision": null
  },
  {
    "url": "assets/ArtSnakeBody-L2mZOf61.js",
    "revision": null
  },
  {
    "url": "assets/ArtShieldBlock-D_t4ApcI.js",
    "revision": null
  },
  {
    "url": "assets/ArtRing-B5eAAsi1.js",
    "revision": null
  },
  {
    "url": "assets/ArtProjectile-DYGxotBS.js",
    "revision": null
  },
  {
    "url": "assets/ArtPowerup-obmavsz7.js",
    "revision": null
  },
  {
    "url": "assets/ArtPortal-D6sAKmj1.js",
    "revision": null
  },
  {
    "url": "assets/ArtPipeCap-BVKhq4Rh.js",
    "revision": null
  },
  {
    "url": "assets/ArtPipeBody-Vjm4Njy1.js",
    "revision": null
  },
  {
    "url": "assets/ArtPaddle-DgT8F-Pm.js",
    "revision": null
  },
  {
    "url": "assets/ArtMultiply-C_g9NfQZ.js",
    "revision": null
  },
  {
    "url": "assets/ArtMissile-MEDWxl3u.js",
    "revision": null
  },
  {
    "url": "assets/ArtLaser-CFvsGIyn.js",
    "revision": null
  },
  {
    "url": "assets/ArtInvaderShip-C0KMhTsq.js",
    "revision": null
  },
  {
    "url": "assets/ArtGround-uB2lBn1v.js",
    "revision": null
  },
  {
    "url": "assets/ArtGoldenItem-B1yXOXMH.js",
    "revision": null
  },
  {
    "url": "assets/ArtGoldenApple-CKWsb7cC.js",
    "revision": null
  },
  {
    "url": "assets/ArtFruitWatermelon-0tgatmr8.js",
    "revision": null
  },
  {
    "url": "assets/ArtFruitStar-D9qAPPyN.js",
    "revision": null
  },
  {
    "url": "assets/ArtFruitOrange-CyHJ3NsF.js",
    "revision": null
  },
  {
    "url": "assets/ArtFruitGrape-4OLeQrtE.js",
    "revision": null
  },
  {
    "url": "assets/ArtFruitApple-BIVWBHqe.js",
    "revision": null
  },
  {
    "url": "assets/ArtEnemySlime-Cth1Ca-6.js",
    "revision": null
  },
  {
    "url": "assets/ArtEnemySkeleton-DpfOyckJ.js",
    "revision": null
  },
  {
    "url": "assets/ArtEnemyNormal-Z1hqWSud.js",
    "revision": null
  },
  {
    "url": "assets/ArtEnemyBoss-B9UMrtQ4.js",
    "revision": null
  },
  {
    "url": "assets/ArtEnemyBat-BdsZ7zOk.js",
    "revision": null
  },
  {
    "url": "assets/ArtCloud-BQ9341l-.js",
    "revision": null
  },
  {
    "url": "assets/ArtClose-7wVEfHkt.js",
    "revision": null
  },
  {
    "url": "assets/ArtCheck-CsJ6-y54.js",
    "revision": null
  },
  {
    "url": "assets/ArtCardFace-ssp8cj41.js",
    "revision": null
  },
  {
    "url": "assets/ArtCardBack-iyche_Ez.js",
    "revision": null
  },
  {
    "url": "assets/ArtBulletPlayer-fC303sPY.js",
    "revision": null
  },
  {
    "url": "assets/ArtBulletAlien-DFrMdAC6.js",
    "revision": null
  },
  {
    "url": "assets/ArtBrickBoss-CommGCAq.js",
    "revision": null
  },
  {
    "url": "assets/ArtBrick-Quoic7rb.js",
    "revision": null
  },
  {
    "url": "assets/ArtBomb-CoXg0kDF.js",
    "revision": null
  },
  {
    "url": "assets/ArtBird-DfQyB8kE.js",
    "revision": null
  },
  {
    "url": "assets/ArtBasket-BbwaCjt9.js",
    "revision": null
  },
  {
    "url": "assets/ArtBall-BCVSf3L_.js",
    "revision": null
  },
  {
    "url": "assets/ArtApple-qpa1DLQ2.js",
    "revision": null
  },
  {
    "url": "assets/ArtAlienSquid-C3ZPnvYg.js",
    "revision": null
  },
  {
    "url": "assets/ArtAlienOctopus-DWWQwOCg.js",
    "revision": null
  },
  {
    "url": "assets/ArtAlienCrab-BVhQ1JL-.js",
    "revision": null
  },
  {
    "url": "assets/Art2048Tile-Cets7hhQ.js",
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





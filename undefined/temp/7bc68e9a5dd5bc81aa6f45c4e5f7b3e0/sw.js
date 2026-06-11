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
    "revision": "150ac5dc07e0ae4c1725ef90047e5c9b"
  },
  {
    "url": "assets/web-BnSh2DiA.js",
    "revision": null
  },
  {
    "url": "assets/spriteLoader-CRqb2i8_.js",
    "revision": null
  },
  {
    "url": "assets/ShopView-jfNMY72k.css",
    "revision": null
  },
  {
    "url": "assets/ShopView-BqxEJ5PC.js",
    "revision": null
  },
  {
    "url": "assets/settingsStore-CbQ7Wahv.js",
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
    "url": "assets/LobbyView-Bz-m9QyI.js",
    "revision": null
  },
  {
    "url": "assets/KawaiiIcon-BAihpqoy.css",
    "revision": null
  },
  {
    "url": "assets/KawaiiIcon-B5uBDUeh.js",
    "revision": null
  },
  {
    "url": "assets/KawaiiDecorLayer-CcoNZzgY.css",
    "revision": null
  },
  {
    "url": "assets/KawaiiDecorLayer-BBseClB8.js",
    "revision": null
  },
  {
    "url": "assets/jeep-sqlite.entry-Cx6dKcOJ.js",
    "revision": null
  },
  {
    "url": "assets/index-YwLNrq8r.js",
    "revision": null
  },
  {
    "url": "assets/index-wAgqUEwh.js",
    "revision": null
  },
  {
    "url": "assets/index-DTxQSBRC.js",
    "revision": null
  },
  {
    "url": "assets/index-Dt5cEJ6C.js",
    "revision": null
  },
  {
    "url": "assets/index-DRjnD9y0.js",
    "revision": null
  },
  {
    "url": "assets/index-Dr-rYOTm.js",
    "revision": null
  },
  {
    "url": "assets/index-DM4YephH.js",
    "revision": null
  },
  {
    "url": "assets/index-Dm1MzoqN.js",
    "revision": null
  },
  {
    "url": "assets/index-DjhJ7Vq7.js",
    "revision": null
  },
  {
    "url": "assets/index-Dhug7BS-.js",
    "revision": null
  },
  {
    "url": "assets/index-CtfraNUS.js",
    "revision": null
  },
  {
    "url": "assets/index-Cq4RYPla.js",
    "revision": null
  },
  {
    "url": "assets/index-CBZc2CIQ.js",
    "revision": null
  },
  {
    "url": "assets/index-CAMKbakS.js",
    "revision": null
  },
  {
    "url": "assets/index-C6pCnkCL.js",
    "revision": null
  },
  {
    "url": "assets/index-C3HNRI_n.js",
    "revision": null
  },
  {
    "url": "assets/index-BZWa2Zq-.css",
    "revision": null
  },
  {
    "url": "assets/iconManifest-B555aK3j.js",
    "revision": null
  },
  {
    "url": "assets/GameResultView-BjHP1AHL.css",
    "revision": null
  },
  {
    "url": "assets/GameResultView-BbBglpH3.js",
    "revision": null
  },
  {
    "url": "assets/GamePlayView-BO4TGqFp.css",
    "revision": null
  },
  {
    "url": "assets/GamePlayView-BnkeaP04.js",
    "revision": null
  },
  {
    "url": "assets/gameOptimizationProfiles-BBf8MQxO.js",
    "revision": null
  },
  {
    "url": "assets/GameInfoView-DSHdEPob.js",
    "revision": null
  },
  {
    "url": "assets/GameInfoView-CIzEQQdN.css",
    "revision": null
  },
  {
    "url": "assets/currencyStore-CdJScJNr.js",
    "revision": null
  },
  {
    "url": "assets/CanvasEffectsManager-kmUPxDjJ.js",
    "revision": null
  },
  {
    "url": "assets/BaseCard-WtL-mC9P.js",
    "revision": null
  },
  {
    "url": "assets/BaseCard-DlQpZLSH.css",
    "revision": null
  },
  {
    "url": "assets/AudioMixerPanel-R79HIGIM.js",
    "revision": null
  },
  {
    "url": "assets/AudioMixerPanel-9WudXtYQ.css",
    "revision": null
  },
  {
    "url": "assets/audio-BLsFeJKY.js",
    "revision": null
  },
  {
    "url": "assets/ArtXpGem-BX51qxy_.js",
    "revision": null
  },
  {
    "url": "assets/ArtTttX-DzQ_Vb9m.js",
    "revision": null
  },
  {
    "url": "assets/ArtTttO-BZq3A3qJ.js",
    "revision": null
  },
  {
    "url": "assets/ArtTttCell-DsHFV9xa.js",
    "revision": null
  },
  {
    "url": "assets/ArtTowerBase-CysL0DIq.js",
    "revision": null
  },
  {
    "url": "assets/ArtTowerBarrel-CqdmTFyk.js",
    "revision": null
  },
  {
    "url": "assets/ArtTetrisBlock-IgGSav9h.js",
    "revision": null
  },
  {
    "url": "assets/ArtTdProjectile-BjBPj_xh.js",
    "revision": null
  },
  {
    "url": "assets/ArtTdEnemy-CJ9h13Z3.js",
    "revision": null
  },
  {
    "url": "assets/ArtSurvivorPlayer-BztE6vVH.js",
    "revision": null
  },
  {
    "url": "assets/ArtSudokuCell-BJHgGrEh.js",
    "revision": null
  },
  {
    "url": "assets/ArtSpecialFood-Djr4uz2Y.js",
    "revision": null
  },
  {
    "url": "assets/ArtSnakeHead-BPiFXETh.js",
    "revision": null
  },
  {
    "url": "assets/ArtSnakeBody-DB-ePnmb.js",
    "revision": null
  },
  {
    "url": "assets/ArtShieldBlock-CoKOT-h3.js",
    "revision": null
  },
  {
    "url": "assets/ArtRing-BGlmIuHr.js",
    "revision": null
  },
  {
    "url": "assets/ArtProjectile-Dm1CVGcw.js",
    "revision": null
  },
  {
    "url": "assets/ArtPowerup-BDlmn3m3.js",
    "revision": null
  },
  {
    "url": "assets/ArtPortal-CHDGgjRY.js",
    "revision": null
  },
  {
    "url": "assets/ArtPipeCap-DZTwfwWS.js",
    "revision": null
  },
  {
    "url": "assets/ArtPipeBody-Be-aHelU.js",
    "revision": null
  },
  {
    "url": "assets/ArtPaddle-CTe1MlEI.js",
    "revision": null
  },
  {
    "url": "assets/ArtMultiply-DiIjKtsG.js",
    "revision": null
  },
  {
    "url": "assets/ArtMissile-CYF_V6uY.js",
    "revision": null
  },
  {
    "url": "assets/ArtLaser-BddbeLh-.js",
    "revision": null
  },
  {
    "url": "assets/ArtInvaderShip-DkSWP081.js",
    "revision": null
  },
  {
    "url": "assets/ArtGround-CE1Btkee.js",
    "revision": null
  },
  {
    "url": "assets/ArtGoldenItem-CbA-TstD.js",
    "revision": null
  },
  {
    "url": "assets/ArtGoldenApple-Bsr4Qrb9.js",
    "revision": null
  },
  {
    "url": "assets/ArtFruitWatermelon-EaJHXMjg.js",
    "revision": null
  },
  {
    "url": "assets/ArtFruitStar-RP5uowNI.js",
    "revision": null
  },
  {
    "url": "assets/ArtFruitOrange-2PpgwEiT.js",
    "revision": null
  },
  {
    "url": "assets/ArtFruitGrape-DDxc6Eti.js",
    "revision": null
  },
  {
    "url": "assets/ArtFruitApple-DhLWpG-U.js",
    "revision": null
  },
  {
    "url": "assets/ArtEnemySlime-BYn_w93Z.js",
    "revision": null
  },
  {
    "url": "assets/ArtEnemySkeleton-ll1MdvqX.js",
    "revision": null
  },
  {
    "url": "assets/ArtEnemyNormal-BJHfCLq_.js",
    "revision": null
  },
  {
    "url": "assets/ArtEnemyBoss-i3G3Ck4a.js",
    "revision": null
  },
  {
    "url": "assets/ArtEnemyBat-C7dvIVu8.js",
    "revision": null
  },
  {
    "url": "assets/ArtCloud-Cyv57Uyw.js",
    "revision": null
  },
  {
    "url": "assets/ArtClose-DWVNWTDq.js",
    "revision": null
  },
  {
    "url": "assets/ArtCheck-CIt1oAq4.js",
    "revision": null
  },
  {
    "url": "assets/ArtCardFace-BmFgOyGF.js",
    "revision": null
  },
  {
    "url": "assets/ArtCardBack-nHOJ5L4R.js",
    "revision": null
  },
  {
    "url": "assets/ArtBulletPlayer-he_fNscV.js",
    "revision": null
  },
  {
    "url": "assets/ArtBulletAlien-Dqnyi4Q9.js",
    "revision": null
  },
  {
    "url": "assets/ArtBrickBoss-B-tVbrHf.js",
    "revision": null
  },
  {
    "url": "assets/ArtBrick-CwAKY2-Y.js",
    "revision": null
  },
  {
    "url": "assets/ArtBomb-EcN21-yA.js",
    "revision": null
  },
  {
    "url": "assets/ArtBird-DUr1R6e9.js",
    "revision": null
  },
  {
    "url": "assets/ArtBasket-CQKvRsDy.js",
    "revision": null
  },
  {
    "url": "assets/ArtBall-D4DENkhL.js",
    "revision": null
  },
  {
    "url": "assets/ArtApple-yKxZe3JO.js",
    "revision": null
  },
  {
    "url": "assets/ArtAlienSquid-DcK6MWM5.js",
    "revision": null
  },
  {
    "url": "assets/ArtAlienOctopus-C23bqkjF.js",
    "revision": null
  },
  {
    "url": "assets/ArtAlienCrab-PPJFFhQD.js",
    "revision": null
  },
  {
    "url": "assets/Art2048Tile-Bj2XdG6b.js",
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





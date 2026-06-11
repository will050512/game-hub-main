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
    "revision": "f0fdc691675e87f8760a37267bbcf882"
  },
  {
    "url": "assets/web-BnSh2DiA.js",
    "revision": null
  },
  {
    "url": "assets/spriteLoader-5I3ZHNnT.js",
    "revision": null
  },
  {
    "url": "assets/ShopView-Dix8vAXf.css",
    "revision": null
  },
  {
    "url": "assets/ShopView-CcF74s69.js",
    "revision": null
  },
  {
    "url": "assets/settingsStore-p5rxanmC.js",
    "revision": null
  },
  {
    "url": "assets/rewardContract-D8dTh0cz.js",
    "revision": null
  },
  {
    "url": "assets/LobbyView-CLK-gP-g.js",
    "revision": null
  },
  {
    "url": "assets/LobbyView-BlY63med.css",
    "revision": null
  },
  {
    "url": "assets/KawaiiIcon-CjeoJA8J.js",
    "revision": null
  },
  {
    "url": "assets/KawaiiIcon-BAihpqoy.css",
    "revision": null
  },
  {
    "url": "assets/KawaiiDecorLayer-E9b5Kx3l.js",
    "revision": null
  },
  {
    "url": "assets/KawaiiDecorLayer-CcoNZzgY.css",
    "revision": null
  },
  {
    "url": "assets/jeep-sqlite.entry-D8SFe5rN.js",
    "revision": null
  },
  {
    "url": "assets/index-SrzsvWEo.js",
    "revision": null
  },
  {
    "url": "assets/index-EOvf3N-t.js",
    "revision": null
  },
  {
    "url": "assets/index-DSSeE4_a.js",
    "revision": null
  },
  {
    "url": "assets/index-DSq9w0cs.js",
    "revision": null
  },
  {
    "url": "assets/index-DM4YephH.js",
    "revision": null
  },
  {
    "url": "assets/index-DkzE0how.js",
    "revision": null
  },
  {
    "url": "assets/index-DF8S1-lO.js",
    "revision": null
  },
  {
    "url": "assets/index-De9phTnD.js",
    "revision": null
  },
  {
    "url": "assets/index-D9b0BqIm.js",
    "revision": null
  },
  {
    "url": "assets/index-CZ7cPOdB.js",
    "revision": null
  },
  {
    "url": "assets/index-CxUS2GCb.js",
    "revision": null
  },
  {
    "url": "assets/index-Csp9q4u5.js",
    "revision": null
  },
  {
    "url": "assets/index-CLrK65BF.js",
    "revision": null
  },
  {
    "url": "assets/index-CedJm0__.js",
    "revision": null
  },
  {
    "url": "assets/index-BZWa2Zq-.css",
    "revision": null
  },
  {
    "url": "assets/index-BpOlGi-Q.js",
    "revision": null
  },
  {
    "url": "assets/index-BiWyXY5n.js",
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
    "url": "assets/GameResultView-Bf84r2Mi.js",
    "revision": null
  },
  {
    "url": "assets/GamePlayView-W9lIK0AF.css",
    "revision": null
  },
  {
    "url": "assets/GamePlayView-DNzTbzZe.js",
    "revision": null
  },
  {
    "url": "assets/gameOptimizationProfiles-BBf8MQxO.js",
    "revision": null
  },
  {
    "url": "assets/GameInfoView-DdbATdoY.js",
    "revision": null
  },
  {
    "url": "assets/GameInfoView-CIzEQQdN.css",
    "revision": null
  },
  {
    "url": "assets/currencyStore-DENlLRsg.js",
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
    "url": "assets/BaseCard-Bufn3l0T.js",
    "revision": null
  },
  {
    "url": "assets/AudioMixerPanel-Doe1u823.js",
    "revision": null
  },
  {
    "url": "assets/AudioMixerPanel-9WudXtYQ.css",
    "revision": null
  },
  {
    "url": "assets/audio-DhHizAmw.js",
    "revision": null
  },
  {
    "url": "assets/ArtXpGem-CMoCBxu7.js",
    "revision": null
  },
  {
    "url": "assets/ArtTttX-DfP0vGbI.js",
    "revision": null
  },
  {
    "url": "assets/ArtTttO-B9QROU2G.js",
    "revision": null
  },
  {
    "url": "assets/ArtTttCell-8uu0oJgL.js",
    "revision": null
  },
  {
    "url": "assets/ArtTowerBase-CV-vK6kM.js",
    "revision": null
  },
  {
    "url": "assets/ArtTowerBarrel-B8f4ZsIq.js",
    "revision": null
  },
  {
    "url": "assets/ArtTetrisBlock-DDPAtCyk.js",
    "revision": null
  },
  {
    "url": "assets/ArtTdProjectile-oRpvUPD_.js",
    "revision": null
  },
  {
    "url": "assets/ArtTdEnemy-CXWnbmhz.js",
    "revision": null
  },
  {
    "url": "assets/ArtSurvivorPlayer-mXcMacLA.js",
    "revision": null
  },
  {
    "url": "assets/ArtSudokuCell-DQ7qYQnH.js",
    "revision": null
  },
  {
    "url": "assets/ArtSpecialFood-BMQ1hM9i.js",
    "revision": null
  },
  {
    "url": "assets/ArtSnakeHead-BwMsyNgB.js",
    "revision": null
  },
  {
    "url": "assets/ArtSnakeBody-B_DQ9oDJ.js",
    "revision": null
  },
  {
    "url": "assets/ArtShieldBlock-1QAzxTf_.js",
    "revision": null
  },
  {
    "url": "assets/ArtRing-CmUJQXGz.js",
    "revision": null
  },
  {
    "url": "assets/ArtProjectile-Dg9qh4Pt.js",
    "revision": null
  },
  {
    "url": "assets/ArtPowerup-CwxE_-0J.js",
    "revision": null
  },
  {
    "url": "assets/ArtPortal-DnL4tUMO.js",
    "revision": null
  },
  {
    "url": "assets/ArtPipeCap-I18APEky.js",
    "revision": null
  },
  {
    "url": "assets/ArtPipeBody-D6C6e8_O.js",
    "revision": null
  },
  {
    "url": "assets/ArtPaddle-Be5z0wgF.js",
    "revision": null
  },
  {
    "url": "assets/ArtMultiply-D3Wh61A-.js",
    "revision": null
  },
  {
    "url": "assets/ArtMissile-Ch2uWWgB.js",
    "revision": null
  },
  {
    "url": "assets/ArtLaser-B3RTYCAF.js",
    "revision": null
  },
  {
    "url": "assets/ArtInvaderShip-BtqvhhHj.js",
    "revision": null
  },
  {
    "url": "assets/ArtGround-DrWJuMjo.js",
    "revision": null
  },
  {
    "url": "assets/ArtGoldenItem-CGaA3FX3.js",
    "revision": null
  },
  {
    "url": "assets/ArtGoldenApple-BGXu4vSg.js",
    "revision": null
  },
  {
    "url": "assets/ArtFruitWatermelon-CWdYc5oS.js",
    "revision": null
  },
  {
    "url": "assets/ArtFruitStar-DdoXvpAe.js",
    "revision": null
  },
  {
    "url": "assets/ArtFruitOrange-DxtyhnXE.js",
    "revision": null
  },
  {
    "url": "assets/ArtFruitGrape-BNKaZ3If.js",
    "revision": null
  },
  {
    "url": "assets/ArtFruitApple-D1cIXTuJ.js",
    "revision": null
  },
  {
    "url": "assets/ArtEnemySlime-J0k1C4Jd.js",
    "revision": null
  },
  {
    "url": "assets/ArtEnemySkeleton-16c7R8Gx.js",
    "revision": null
  },
  {
    "url": "assets/ArtEnemyNormal-CtvJ4ktF.js",
    "revision": null
  },
  {
    "url": "assets/ArtEnemyBoss-G0VDC3rE.js",
    "revision": null
  },
  {
    "url": "assets/ArtEnemyBat-BweIYd2f.js",
    "revision": null
  },
  {
    "url": "assets/ArtCloud-BdHqRdQh.js",
    "revision": null
  },
  {
    "url": "assets/ArtClose-DH-tRS72.js",
    "revision": null
  },
  {
    "url": "assets/ArtCheck-B8A3KPB7.js",
    "revision": null
  },
  {
    "url": "assets/ArtCardFace-CRUMkRXd.js",
    "revision": null
  },
  {
    "url": "assets/ArtCardBack-0jtf_A01.js",
    "revision": null
  },
  {
    "url": "assets/ArtBulletPlayer-CaMesidQ.js",
    "revision": null
  },
  {
    "url": "assets/ArtBulletAlien-JLeStbea.js",
    "revision": null
  },
  {
    "url": "assets/ArtBrickBoss-Dndfq3rV.js",
    "revision": null
  },
  {
    "url": "assets/ArtBrick-qjIXUZMA.js",
    "revision": null
  },
  {
    "url": "assets/ArtBomb-Ni1JJI1H.js",
    "revision": null
  },
  {
    "url": "assets/ArtBird-Bhc6VjFm.js",
    "revision": null
  },
  {
    "url": "assets/ArtBasket-DCSjZ4K9.js",
    "revision": null
  },
  {
    "url": "assets/ArtBall-DnY-WDcK.js",
    "revision": null
  },
  {
    "url": "assets/ArtApple-kDMQ9fHf.js",
    "revision": null
  },
  {
    "url": "assets/ArtAlienSquid-oAip44Gj.js",
    "revision": null
  },
  {
    "url": "assets/ArtAlienOctopus-krLa5YP3.js",
    "revision": null
  },
  {
    "url": "assets/ArtAlienCrab-yHrfX_Ce.js",
    "revision": null
  },
  {
    "url": "assets/Art2048Tile-2pakAIWx.js",
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





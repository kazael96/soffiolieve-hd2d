window.ICIRRUS_BADGE_ASSETS={"source":"IRBI a/1/1/7:8,47 + a/1/1/5; native jet badge receipt","backgroundSha256":"09931ad67743796e8b0d7cfbfecc902f8f28abce7e811391b5881bf470e5bb1a","models":{"jetBadgeM":{"url":"assets/field-effects/jetBadgeM/gymbadge6.glb","sourceMembers":[45,46,47],"frames":361},"jetBadgeF":{"url":"assets/field-effects/jetBadgeF/gymbadge6f.glb","sourceMembers":[168,169,170],"frames":361}},"materialAlpha":{"jetBadgeM":{},"jetBadgeF":{}},"effects":{"8":{"descriptor":[15,0,0,270,16,45,0,0,18,19,20,65535,46,47,48,65535,1,0],"background":"badgeBackground","item":"jetBadgeM","frames":361,"particles":false,"descriptorSha256":"b01aab42e413556621bf7648b0d49a68d70b65a1e6f8012ba4504519d56d13c1","label":"Medaglia Jet","adaptation":"Original models, joint animation and shared background alpha; visibility/pattern and SPL15 are not reconstructed"},"47":{"descriptor":[15,0,0,270,16,168,0,0,18,19,20,65535,169,170,171,65535,1,0],"background":"badgeBackground","item":"jetBadgeF","frames":361,"particles":false,"descriptorSha256":"f9709013e46c432a303352bf8d91b867197fa3100424e43482b03d23155edcd0","label":"Medaglia Jet","adaptation":"Original models, joint animation and shared background alpha; visibility/pattern and SPL15 are not reconstructed"}},"hashes":{"45":"b145c222c420e371cc8df637f527d61fd1a18ab368981b7fe002087f172394c5","46":"53d2e9eaa748700f5bd2c7a32d2d671786b6ca5efde134d61d9f13d83fd3329d","47":"15d3346ae9465203cbdf2839029f84a9a4830ac99befccb47d8d46a0d52a5a2d","168":"7c53240dac205ca3d12b8ccb6de28a2375fc0e7d99edc02d961aacffeb339e64","169":"fddd9df3dfd371ac2d6ee56140e9f62d1e0e338f999959d3f033e113451e93f4","170":"113e9a2f906c4a6b5878fe38ea879f99b2aa21bf61325c39d08d0759d23a0824"}};
(function(root){
  const extension=root.ICIRRUS_BADGE_ASSETS;
  function install(target=root.FIELD_EFFECT_ASSETS){
    if(!target?.models?.badgeBackground)throw Error('Native badge background unavailable');
    if(target.hashes?.['16']!==extension.backgroundSha256)throw Error('Native badge background mismatch');
    for(const key of ['models','materialAlpha','effects','hashes'])Object.assign(target[key]??={},extension[key]);
    return target;
  }
  root.IcirrusBadgeAssets={install};
  if(root.FIELD_EFFECT_ASSETS)install();
})(typeof window!=='undefined'?window:globalThis);

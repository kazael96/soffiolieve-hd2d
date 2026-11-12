window.LEAGUE_BADGE_ASSETS={"source":"IRBI a/1/1/7:10,49 + a/1/1/5; native legend badge receipt","backgroundSha256":"09931ad67743796e8b0d7cfbfecc902f8f28abce7e811391b5881bf470e5bb1a","models":{"legendBadgeM":{"url":"assets/field-effects/legendBadgeM/gymbadge8.glb","sourceMembers":[53,54,55],"frames":361},"legendBadgeF":{"url":"assets/field-effects/legendBadgeF/gymbadge8f.glb","sourceMembers":[176,177,178],"frames":361}},"materialAlpha":{"legendBadgeM":{},"legendBadgeF":{}},"effects":{"10":{"descriptor":[15,0,0,270,16,53,0,0,18,19,20,65535,54,55,56,65535,1,0],"background":"badgeBackground","item":"legendBadgeM","frames":361,"particles":false,"descriptorSha256":"e4dc9c95ee6d5c708b36d00d2498db23d71142ee16b8bd008e7703dc8a69518f","label":"Medaglia Leggenda","adaptation":"Original models, joint animation and shared background alpha; visibility/pattern and SPL15 are not reconstructed"},"49":{"descriptor":[15,0,0,270,16,176,0,0,18,19,20,65535,177,178,179,65535,1,0],"background":"badgeBackground","item":"legendBadgeF","frames":361,"particles":false,"descriptorSha256":"4109ad0ab3ad6149c9974544971a894dfa69cc5263ab4175d85892849477f8a7","label":"Medaglia Leggenda","adaptation":"Original models, joint animation and shared background alpha; visibility/pattern and SPL15 are not reconstructed"}},"hashes":{"53":"b230c6ecb23d53d48da2b4b7069df17e759c6c20df3846379be557e346c58f29","54":"7160d2f5d45213a534a7d022ad154b61b9f68982b033d677ada300df87d4ac5a","55":"dd7a2dae706e639555d2c7f78e0a3f6cf866e4860722133a076f6ef56f4478f0","176":"f06ce4054ab103bc3833f6673ccbcad48340438d2d2f2da8eef94e8311cbc028","177":"4b0de46fe606493c7a1e4aaf27b925f89ad0412ce47661b32669563945445e88","178":"ab73a47d081dde6b36f2486087142f21e45ca9ebfdcab5b3e4002fbaa3ed72e2"}};
(function(root){
  const extension=root.LEAGUE_BADGE_ASSETS;
  function install(target=root.FIELD_EFFECT_ASSETS){
    if(!target?.models?.badgeBackground)throw Error('Native badge background unavailable');
    if(target.hashes?.['16']!==extension.backgroundSha256)throw Error('Native badge background mismatch');
    for(const key of ['models','materialAlpha','effects','hashes'])Object.assign(target[key]??={},extension[key]);
    return target;
  }
  root.LeagueBadgeAssets={install};
  if(root.FIELD_EFFECT_ASSETS)install();
})(typeof window!=='undefined'?window:globalThis);

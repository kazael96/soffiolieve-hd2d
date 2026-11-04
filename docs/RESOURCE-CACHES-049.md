# Cache grafiche e animazioni · 0.49

L’audit durante la matrice 0.49 ha rilevato ritenzione senza budget nei dizionari GPU del mondo, negli atlanti Nitro e nei canvas OAM. Tornare nella stessa scena riutilizzava le risorse; visitare scene/specie nuove continuava ad aggiungerne. Non è stato rilevato un caricamento per ogni fotogramma nei controller di Rafan o dei cristalli: aggiornano buffer esistenti. La LRU condivisa di `RuntimeAssets` non limitava queste copie e i riferimenti conservati dagli altri moduli.

L’inventario statico analizzato contava 176 chiavi di modelli 0.49, 5.628.084 byte di buffer, 758 texture ambientali da 2.992.384 byte RGBA e 490 fotogrammi degli attori da 2.007.040 byte RGBA: circa 10,1 MiB di risorse del mondo aggiunte dalla tappa. Gli atlanti predisposti passano da 114 front/back nella 0.48 (55.050.240 byte RGBA) a 172 nella 0.49 (79.298.560 byte). Le 58 nuove banche aggiungono 24.248.320 byte, circa 23,1 MiB. I JSON su disco misuravano rispettivamente 1.159.089 e 1.685.647 byte. Sono conteggi statici del contenuto analizzato, non un picco osservato nella GPU.

| Consumatore | Budget predefinito | Risorse protette |
| --- | --- | --- |
| `VillageRenderer` | 32 MiB e 1.024 voci complessive | geometria, texture e tutti i fotogrammi degli attori richiesti dalla scena; preparazioni in corso |
| `ROM_SPRITE_ANIM` atlanti + dati | 24 MiB e 32 banche front/back | preparazioni in corso, ultima preparazione completata, slot attivi p1/p2/p3/p4, pin espliciti |
| `ROM_SPRITE_ANIM` compositi OAM | 8 MiB e 512 canvas complessivi | banche protette o in caricamento; composito in disegno |
| `RuntimeAssets` condivisa | 16 MiB e 512 immagini | conserva il budget già introdotto nella 0.44 |

I budget sono obiettivi per la cache riutilizzabile. Se il solo insieme necessario supera il limite, rimane integro e `overBudget` lo segnala: non si tolgono superfici o attori dalla scena per rientrare nel numero. L’evizione usa l’ultimo impiego, elimina effettivamente texture/buffer WebGL inutilizzati e lascia ricaricabili le risorse originali. Per gli sprite si eliminano riferimenti e compositi; non viene chiamato `image.close()` su immagini di proprietà condivisa, né si ridimensionano canvas che un altro chiamante potrebbe ancora usare.

I byte del mondo derivano da vertici ×44 e larghezza ×altezza ×4. Quelli delle banche sommano RGBA e una stima UTF-16 del JSON serializzato; i canvas OAM usano larghezza ×altezza ×4. Il browser decide copie interne, upload Canvas2D, compressione e tempi del garbage collector. Questi contatori non misurano la memoria totale del processo. Escludono framebuffer, geometria CPU globale, JavaScript statico, audio, font e driver. A 1280×720 i due target RGBA e il depth16 del mondo richiedono altri 9.216.000 byte stimati; il framebuffer del browser e l’antialiasing possono aggiungere memoria.

Le risorse in caricamento restano protette fino al loro completamento, anche se una nuova scena le supera. Le epoche impediscono l’upload tardivo dopo sostituzione o ripristino WebGL. I caricamenti Nitro controllano l’identità del record prima di pubblicare il risultato. Le informazioni minime degli ultimi 128 errori restano separate dagli atlanti espulsi, evitando che un disegno ripetuto azzeri i tentativi; il recupero esplicito può riprovare. Allocazioni parziali di buffer, texture e shader vengono liberate in caso di eccezione.

Per un consumatore che mantiene un’animazione oltre una singola preparazione:

```js
const release = ROM_SPRITE_ANIM.pin(['595-front', '599-front']);
try {
  const sprites = ['595-front', '599-front'].map(key => ROM_SPRITE_ANIM.load(key));
  await Promise.all(sprites.map(s => s.promise));
  if (sprites.some(s => !s.ready)) throw Error('Sprite non disponibile');
  // Conservare release finché il consumatore usa queste banche.
} catch (error) {
  release();
  throw error;
}
// Al ritiro del consumatore: release(); è idempotente.
```

Il proprietario di `BattleDiorama` usa questo contratto per i propri osservatori ambientali. La sua LRU GPU e le sue prove sono documentate separatamente; questo intervento mantiene `FieldModels`, con il piccolo inventario finito già censito.

Il profilo browser può leggere `renderer.cacheStats()` e `ROM_SPRITE_ANIM.cacheStats()` dopo primo uso, ritorno, visite ripetute e ripristino del contesto. Entrambi espongono `entries`, `bytes`, limiti, numero di risorse protette, `overBudget` ed evizioni. Gli sprite includono i compositi sotto `layers`. Un aumento di evizioni durante il ritorno è atteso; un aumento continuo del numero di voci oltre il budget senza risorse protette richiederebbe indagine.

Verifiche eseguite: 16 prove nuove e 45 regressioni esistenti, tutte passate con `node --test --test-isolation=none`. Le nuove prove attraversano 40 scene, espulsione/ritorno, preparazioni sovrapposte, perdita/ripristino del contesto, errori e recupero, tutti gli slot multi, proprietà delle immagini condivise e budget OAM globale. Inoltre caricano tutte le 58 banche native aggiunte, nei due ordini, con 464 disegni di fotogrammi campionati. Quest’ultima prova usa geometria/atlanti originali e dimensioni PNG reali ma un Canvas2D simulato: certifica gestione delle risorse e ricostruzione, non il risultato dei pixel. La matrice browser eseguita prima di questa modifica resta distinta; il profilo GPU e il controllo grafico della nuova candidata sono a carico del collaudo finale.

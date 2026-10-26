# Grafico del verso: IRBI

La versione 0.16 usa i campioni originali del WAV, ricavati dalla sorgente PCM8 della ROM, anche quando l'audio del browser è disattivato. Non usa un analizzatore FFT né l'ampiezza del mix finale.

Overlay208 `021C3740..021C3912` calcola gli estremi di ogni colonna. Il passo è `sampleRate * nativeSpeed / 32768 / 60 / 2`, con arrotondamenti float32; il limite di ogni intervallo viene troncato e il cursore successivo parte dal limite+1. Ogni campione signed8 è moltiplicato per47 e per il volume nativo, con due divisioni intere per128, quindi limitato a ±55. Massimo960 colonne.

`021C3578` prepara la linea a y55, larga238px. `021C35CC` avanza due colonne per aggiornamento a60Hz, nella finestra `[8,16,248,120]`; dieci colonne a destra restano libere. L'accumulatore del browser mantiene la velocità indipendente dalla frequenza del display. I test coprono campioni negativi, divisioni troncate, limiti degli intervalli e scorrimento.

Il renderer canvas ricompone le colonne; non emula la memoria tilemap del Nintendo DS. Il filtro di uscita dell'audio rimane quello WebAudio del browser.

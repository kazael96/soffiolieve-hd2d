# Riavvio e velocità diretta — 0.32

Due comandi compatti in alto a destra del campo e della lotta: ×1/×2/×4 e ↺ Ricomincia. La velocità cambia anche con F, fuori dai campi di testo e senza ripetizione alla pressione prolungata. Resta disponibile durante i dialoghi della storia; nei menu nativi si usa anche la voce già presente nelle Opzioni. Nei laboratori di anteprima il riavvio è nascosto per mantenere l'isolamento del salvataggio.

La velocità usa GameSpeed e pubblica le modifiche a tutti i selettori rapidi. Se cambia durante una mossa, viene accodata: l'asterisco e l'etichetta accessibile indicano che si applicherà alla fine dell'azione. Più tocchi fanno scorrere la velocità richiesta; non desincronizzano audio/animazione.

Ricomincia apre una conferma esplicita con Annulla come scelta iniziale. La cancellazione riguarda solo la chiave della storia di questa demo nel browser corrente; preserva impostazioni audio, visuale e velocità. L'annullamento non modifica i progressi. Se la cancellazione è vietata o la chiave rimane presente, si mostra un errore e non si ricarica.

Il vecchio comando nascosto nel diario cancellava la chiave e ricaricava, ma pagehide poteva riscrivere lo stato precedente. Journey.restart ora disabilita l'autosalvataggio prima della cancellazione e del reload; il comando precedente usa lo stesso servizio.

Verifiche: cancellazione della sola chiave prevista, preservazione preferenze, blocco di save anche forzato prima del reload, errori di storage, ciclo velocità diretto e cambi accodati. Nel browser, salvataggio fittizio in memoria: annullamento, riavvio confermato, tasto F e comando durante un dialogo. La prova non cancella il salvataggio reale dell'utente. Controlli di build e regressione prima della pubblicazione.

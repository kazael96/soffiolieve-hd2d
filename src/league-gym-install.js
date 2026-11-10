/* Load after original geometry metadata and controllers, before the shared chapter. */
(()=>{
 if(!window.LEAGUE_SCENES?.[121]||!window.LEAGUE_GYM_DATA||!window.LeagueGymController)throw Error('Configurazione della palestra di Aristide incompleta');
 window.LeagueGym=LeagueGymController.create();
})();

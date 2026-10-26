/* Définition des 4 grilles d’évaluation.
   Fichier partagé par index.html (formulaire) et admin.html (modification par l’administrateur).
   Pour changer un barème ou un critère, modifiez uniquement ce fichier. */
// B = tout ou rien (max points ou 0), option NA
// A = « toutes les conditions » : points complets seulement si toutes les cases sont cochées
// C = critères : chaque case cochée rapporte w points
const B=(id,label,max,hint,o={})=>Object.assign({id,label,max,hint,type:'bin'},o);
const A=(id,label,max,crit,hint)=>({id,label,max,hint,type:'all',crit});
const C=(id,label,crit,hint)=>({id,label,hint,type:'crit',crit,max:crit.reduce((s,c)=>s+c.w,0)});

const DISCIPLINE_COMMUN = [
  B('reunions','Participation aux réunions statutaires',2,'Présence à 100 % ou absence justifiée. 0 si absence non justifiée.'),
  B('assiduite','Assiduité et ponctualité',2,'Bonne ponctualité et assiduité, absences justifiées.'),
  B('tenue','Port de tenue correcte et réglementaire',2,'2 points si tenue correcte et réglementaire, 0 sinon.'),
  B('demandes','Nombre de demandes d’explication reçues',2,'2 points si aucune demande, 0 dès qu’une demande a été reçue.',{yes:'Aucune',no:'Une ou plus'}),
  B('accueil','Accueil des patients',5,'5 points si bon accueil, 0 dans le cas contraire.',{yes:'Bon accueil',no:'Mauvais accueil'})
];

const GRIDS = {
  maternite:{
    label:'Sages-femmes / personnel qualifié de la maternité',
    sections:[
      {name:'PEC des cas pathologiques / IST', items:[
        B('pec_proto','Respect du protocole de prise en charge',3,'Diagnostic correct selon les symptômes et traitement approprié (à recueillir à l’entretien).')
      ]},
      {name:'CPN', items:[
        A('cpn','Carte maternelle et facteurs de risque',3,[
          'Remplissage correct de la carte maternelle (conforme à la grille qualité)',
          'Adéquation des actions en cas de détection de facteurs de risque'],
          'Carte validée si les deux items sont corrects (entretien et exploitation documentaire).')
      ]},
      {name:'CPoN', items:[
        B('cpon','Respect du protocole de prise en charge',2,'Examen au spéculum, toucher vaginal, conseils et examen du nouveau-né (entretien). 0 si non maîtrise.')
      ]},
      {name:'Accouchement', items:[
        A('accouch','Surveillance de l’accouchement et GATPA',4,[
          'Respect du protocole de surveillance de l’accouchement (grille de qualité globale)',
          'Respect des trois gestes de la GATPA'],
          'Validé si les deux items sont corrects (exploitation documentaire et entretien).')
      ]},
      {name:'PF', items:[
        A('pf','Cartes PF et effets secondaires',4,[
          'Remplissage correct des cartes',
          'Adéquation des actions en cas d’effets secondaires'],
          'Validé si les deux items sont corrects (entretien et exploitation documentaire).')
      ]},
      {name:'SONU', items:[
        B('hbb','Réanimation du nouveau-né selon HBB',5,'Maîtrise de la technique : 5 points, 0 dans le cas contraire.'),
        B('mgso4','Administration du sulfate de magnésium',5,'Dosage, posologie, effets secondaires et CAT en cas de surdosage. 0 si une seule mauvaise réponse.'),
        B('amiu','AMIU (indications et technique)',2,'Bonne maîtrise des indications et de la technique.')
      ]},
      {name:'Outils, supports de données et discipline', items:[
        B('reg_acc','Registre d’accouchement rempli complètement et correctement',2,'Remplissage correct du registre.'),
        B('reg_smi','Registre SMI rempli complètement et correctement',2,'Enregistrement de toutes les données (C6) : CPN, accouchement, PF du trimestre.')
      ].concat(DISCIPLINE_COMMUN)}
    ]
  },

  dispensaire:{
    label:'Infirmiers (dispensaire et PEV)',
    sections:[
      {name:'PEC des cas pathologiques / IST', items:[
        B('ist','Respect du protocole de prise en charge des IST',3,'À recueillir à l’entretien. 3 points si bonne maîtrise, 0 sinon.'),
        C('patho','Prise en charge des cas pathologiques',[
          {l:'Paludisme simple',w:1},{l:'Paludisme grave',w:1},{l:'IRA',w:1},{l:'Diarrhées aiguës',w:1},{l:'HTA grade 1',w:1}],
          '1 point par affection dont la PEC est bien maîtrisée.')
      ]},
      {name:'Malnutrition', items:[
        B('malnut','Respect du protocole de PEC',3,'3 points si bonne maîtrise (l’utilisation de la bâche est autorisée). 0 si non maîtrisé malgré la bâche.')
      ]},
      {name:'Vaccination', items:[
        A('cartes_vac','Cartes de vaccination',3,[
          'Remplissage correct des cartes (conforme à la grille qualité)',
          'Enregistrement des cartes sélectionnées dans le registre de vaccination'],
          'Cas validé si les deux items sont corrects (centres intégrés).'),
        B('calendrier','Calendrier vaccinal',5,'Bonne connaissance du calendrier vaccinal : comparer les réponses de l’agent au calendrier ci-dessous.',{ref:true}),
        B('vaccins','Types de vaccins et sites d’injection',5,'Bonne connaissance des types de vaccins et des sites d’injection : comparer les réponses de l’agent au calendrier ci-dessous.',{ref:true}),
        C('froid','Chaîne du froid',[
          {l:'Relevé quotidien des températures',w:1},{l:'Bon rangement des vaccins',w:1},
          {l:'Tracé de la courbe',w:1},{l:'Reconnaissance des alarmes positive et négative',w:1}],
          '1 point par rubrique.')
      ]},
      {name:'Remplissage des outils et supports de données', items:[
        B('pointage','Fiche de pointage',2,'Remplissage correct.')
      ]},
      {name:'Discipline', items:DISCIPLINE_COMMUN}
    ]
  },

  aide_soignant:{
    label:'Aides-soignants',
    sections:[
      {name:'Hygiène et entretien', items:[
        B('balayage','Balayage et faubérage des locaux',2,'Entretien avec le responsable du service. 2 points si fait au quotidien.'),
        B('materiel','Nettoyage, stérilisation et rangement du matériel',1,'Cahier de nettoyage, stérilisation et rangement rempli au quotidien.'),
        B('froid','Entretien de la chaîne de froid',1,'Cahier d’entretien à jour.')
      ]},
      {name:'Activités de soins et de tri', items:[
        B('constantes','Prise des constantes / tri des malades',1,'À évaluer au quotidien. Vérifier la connaissance du tri : jetons numérotés disponibles, bureau du chef de poste et autres salles de consultation, priorité à l’urgence reçue.'),
        B('tdr','Réalisation des TDR',1,'Vérifier l’inscription sur les cassettes de TDR : date, heure, initiales de l’agent ayant testé le patient.')
      ]},
      {name:'Outils et supports', items:[
        B('pointage','Remplissage des cartes et registres de pointage',1,'Sondage de 5 pages à confronter avec les données du registre SMI.'),
        B('cartes','Tri et rangement des cartes',1,'Rangement par mois de rendez-vous. NA s’il n’y a pas de bacs à échéancier.')
      ]},
      {name:'Discipline', items:[
        B('reunions','Participation aux réunions statutaires',1,'Vérifier les listes de présence : 100 % de participation. 0 si absence non justifiée.'),
        B('accueil','Accueil des patients',5,'5 points si l’agent est réputé bien accueillir les clients, 0 si mauvais accueil signalé.',{yes:'Bon accueil',no:'Mauvais accueil'}),
        B('assiduite','Assiduité et ponctualité',2,'Agent assidu et ponctuel.'),
        B('demandes','Nombre de demandes d’explication reçues',2,'2 points si aucune demande, 0 dès qu’une demande a été reçue.',{yes:'Aucune',no:'Une ou plus'}),
        B('tenue','Port de tenue réglementaire',2,'Agent réputé être toujours en tenue réglementaire.')
      ]}
    ]
  },

  commis:{
    label:'Commis (pharmacie et caisse)',
    sections:[
      {name:'Pharmacie', items:[
        B('proprete','Propreté de la pharmacie de détail',3,'3 points si bon état de propreté à toutes les évaluations, 0 si mauvais état.',{yes:'Propre',no:'Mauvais état'}),
        C('remecom','Remplissage du ReMeCom',[
          {l:'Remplissage sans erreur (vérifier le stock théorique à 5 dates au hasard)',w:2},
          {l:'ReMeCom à jour',w:2},
          {l:'ReMeCom arrêté à la fin de chaque mois',w:2},
          {l:'Concordance bons de ravitaillement / ReMeCom (3 produits au hasard)',w:2}],
          '2 points par critère respecté.'),
        C('depouill','Fiches de dépouillement journalières',[
          {l:'Toutes les sorties de médicaments et consommables sont inscrites',w:2},
          {l:'Fiche de dépouillement à jour',w:2},
          {l:'Fiche arrêtée et signée en fin de journée',w:2}],
          '2 points par critère respecté.')
      ]},
      {name:'Caisse', items:[
        C('quittance','Délivrance de quittance',[
          {l:'Quittance délivrée systématiquement à chaque malade ayant honoré son ordonnance (vérifier 5 ordonnances)',w:2},
          {l:'Quittance correctement remplie (nom et prénoms du client, signature et nom du commis, montant en chiffres et en lettres)',w:2}],
          '2 points par critère respecté.'),
        C('recettes','Cahiers de recettes journalières',[
          {l:'Sans erreur (concordance entre total recettes de la fiche de dépouillement et du cahier de recette)',w:2},
          {l:'À jour (tous les cahiers de recettes journalières sont disponibles)',w:2}],
          '2 points par critère respecté.'),
        C('transmission','Cahier de transmission de recettes',[
          {l:'Cahier signé au quotidien par le commis et le chef de poste / comptable',w:2}],
          '2 points si le critère est respecté.')
      ]},
      {name:'Gestion du stock', items:[
        B('fiche_stock','Mise à jour des fiches de stock',2,'Fiche de stock au magasin renseignée à chaque mouvement. (Points non précisés dans la grille : 2 points retenus.)')
      ]}
    ]
  }
};


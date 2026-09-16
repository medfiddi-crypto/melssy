export const landing = {
  sectionOrder: ["ugc", "reviews"] as const,
  hero: {
    eyebrow: "La Beauty Night Ritual™",
    headline: "Réveillez-vous avec des cheveux qui vous ressemblent encore.",
    body: "Le rituel du soir pensé pour accompagner vos longueurs, préserver vos boucles et rendre le matin plus doux.",
  },
  ctas: {
    completeRitual: "Complétez votre rituel",
    viewOrderForm: "Voir le formulaire",
  },
  upsell: {
    title: "Une seconde paire ?",
    body: "Une paire de taies satinées en plus, pour la chambre d'amis ou pour offrir. Ajoutée à votre commande, livrée ensemble.",
    accept: "Oui, ajouter à ma commande",
    decline: "Non merci, continuer",
  },
  problem: {
    title: "La nuit ne devrait pas effacer ce que vous avez pris le temps de faire.",
    body: "Frottements, frisottis, boucles aplaties, longueurs moins nettes: l'oreiller peut transformer votre coiffure pendant que vous dormez. Le matin ne peut pas toujours rattraper huit heures de nuit.",
  },
  satin: {
    title: "Plus de douceur là où vos cheveux se reposent.",
    body: "Une surface satinée accompagne les longueurs avec moins de friction qu'une surface plus rugueuse. Un geste simple pour une routine du soir plus attentionnée.",
  },
  satinComparison: {
    eyebrow: "Pourquoi le satin",
    headline: "Votre oreiller travaille contre vos cheveux pendant huit heures.",
    subheadline: "Et le matin, vous accusez vos cheveux.",
    blocks: [
      {
        lead: "Le coton absorbe. C'est son métier.",
        text: "On fabrique les serviettes en coton pour une raison : il boit l'eau. Votre taie d'oreiller fait exactement la même chose, huit heures par nuit. L'huile que vous appliquez le soir, l'hydratation de votre masque, votre crème de nuit — une partie finit dans le tissu. Le satin, lui, n'absorbe rien. Ce que vous mettez sur vos cheveux y reste.",
      },
      {
        lead: "Vous bougez 20 à 40 fois par nuit.",
        text: "Pas une fois. Des dizaines. À chaque mouvement, vos cheveux sont traînés sur la trame du coton — une grille rugueuse, invisible à l'œil nu. Le satin n'a pas de trame en relief : les cheveux glissent au lieu d'accrocher.",
      },
      {
        lead: "Les frisottis ne viennent pas de nulle part.",
        text: "Votre cheveu est couvert d'écailles superposées, comme des tuiles. La friction les soulève. Des écailles soulevées, c'est précisément ça, un frisottis. Voilà pourquoi vos cheveux sont souvent moins beaux au réveil qu'au moment où vous vous êtes couchée.",
      },
    ],
    closing: "Ce n'est pas de la soie. C'est du satin 100% polyester, choisi précisément parce qu'il n'absorbe pas et qu'il supporte le lavage. Nous préférons vous le dire.",
    imageAlt: "Comparaison macro entre une trame de coton et une trame de satin, côte à côte",
  },
  comparison: {
    title: "Un rituel pensé, pas un essentiel choisi au hasard.",
    melssy: "Des pièces coordonnées, pensées pour se compléter dans votre soirée.",
    generic: "Un accessoire isolé, sans rituel clair ni expérience pensée autour de votre nuit.",
  },
  preview: {
    eyebrow: "Aperçu de mise en page",
    ugcTitle: "Vos vidéos clientes.",
    ugcCards: [
      { name: "Prénom", quote: "Aperçu d'un témoignage vidéo." },
      { name: "Prénom", quote: "Aperçu d'un témoignage vidéo." },
      { name: "Prénom", quote: "Aperçu d'un témoignage vidéo." },
      { name: "Prénom", quote: "Aperçu d'un témoignage vidéo." },
      { name: "Prénom", quote: "Aperçu d'un témoignage vidéo." },
      { name: "Prénom", quote: "Aperçu d'un témoignage vidéo." },
    ],
    reviewsTitle: "Avis clientes.",
    reviewsBody: "Aperçu réservé à la validation de mise en page.",
  },
  faq: [
    ["Comment se passe le paiement?", "Vous réglez votre commande à la livraison, après confirmation avec notre équipe."],
    ["Où livrez-vous?", "Nous livrons partout au Maroc. Les modalités précises sont confirmées avant l'envoi."],
    ["Le rituel convient-il à tous les cheveux?", "Il est conçu comme un geste de douceur pour les longueurs et les coiffures. Il ne remplace pas un avis ou un soin professionnel."],
    ["Comment entretenir les pièces?", "Les conseils d'entretien définitifs seront précisés avec les informations matière vérifiées avant lancement."],
  ],
} as const;